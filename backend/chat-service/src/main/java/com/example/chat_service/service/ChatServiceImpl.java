package com.example.chat_service.service;

import com.example.chat_service.dto.*;
import com.example.chat_service.entity.Chat;
import com.example.chat_service.entity.Message;
import com.example.chat_service.entity.UserSnapshot;
import com.example.chat_service.enums.MessageType;
import com.example.chat_service.exception.AccessDeniedException;
import com.example.chat_service.exception.OfferActiveException;
import com.example.chat_service.repository.ChatRepository;
import com.example.chat_service.repository.MessageRepository;
import com.example.chat_service.repository.UserSnapshotRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@AllArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final UserSnapshotRepository userSnapshotRepository;
    private final FileStorageService fileStorageService;
    private final SimpMessagingTemplate messagingTemplate;

    // Buffer for chunks
    private final Map<String, TreeMap<Integer, String>> chunkBuffers = new ConcurrentHashMap<>();

    // Locks per fileKey
    private final Map<String, Object> fileLocks = new ConcurrentHashMap<>();
    private final List<String> allFileUrls = Collections.synchronizedList(new ArrayList<>());
    private final Object allFilesLock = new Object();

    @Override
    @Transactional
    public void saveChunks(List<FileChunk> chunks, MessageRequest messageRequest, Integer totalChunks, Long chatId, Integer totalFiles) {

        if (chunks == null || chunks.isEmpty()) return;

        for (FileChunk chunk : chunks) {
            String fileKey = messageRequest.getItemId() + "_" + chunk.getFileName();
            log.info("Processing chunk {} of file '{}'", chunk.getChunkIndex(), chunk.getFileName());

            fileLocks.computeIfAbsent(fileKey, k -> new Object());

            synchronized (fileLocks.get(fileKey)) {
                chunkBuffers.computeIfAbsent(fileKey, k -> new TreeMap<>());
                chunkBuffers.get(fileKey).put(chunk.getChunkIndex(), chunk.getDataBase64());

                log.info("Buffered chunk {} of file '{}'. Total buffered: {}/{}",
                        chunk.getChunkIndex(), chunk.getFileName(), chunkBuffers.get(fileKey).size(), totalChunks);

                TreeMap<Integer, String> orderedChunks = chunkBuffers.get(fileKey);

                if (orderedChunks.size() == totalChunks) {
                    log.info("All chunks received for file '{}'. Assembling file...", chunk.getFileName());
                    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                        for (Map.Entry<Integer, String> entry : orderedChunks.entrySet()) {
                            byte[] decoded = Base64.getDecoder().decode(entry.getValue());
                            baos.write(decoded);
                        }

                        byte[] fileBytes = baos.toByteArray();
                        String extension = chunk.getExtension() != null ? chunk.getExtension() : "bin";

                        String storedUrl = fileStorageService.storeFile(
                                fileBytes,
                                chunk.getFileName() + "." + extension,
                                chatId
                        );
                        allFileUrls.add(storedUrl); // thread-safe
                        log.info("Stored file '{}' with URL: {}", chunk.getFileName(), storedUrl);

                    } catch (IOException e) {
                        throw new RuntimeException("Failed to store file chunks for fileKey '" + fileKey + "'", e);
                    } finally {
                        chunkBuffers.remove(fileKey);
                        fileLocks.remove(fileKey);
                        log.info("Cleared buffers and lock for file '{}'", chunk.getFileName());
                    }
                }
            }
        }

        synchronized (allFilesLock) {
            if (allFileUrls.size() == totalFiles) {
                try {
                    ObjectMapper mapper = new ObjectMapper();

                    List<String> fileUrls = List.copyOf(allFileUrls);
                    String fileUrlsJson = mapper.writeValueAsString(allFileUrls);

                    log.info("All files stored. Sending single message with URLs: {}", fileUrlsJson);
                    log.info("Sending single message with URLs: {}", fileUrls);
                    Message fileMessage = saveMessageAndUpdateChat(
                            messageRequest,
                            MessageType.MEDIA,
                            fileUrlsJson);
                    WebSocketMessage wsFileMessage = buildWebSocketMessage(fileMessage, fileUrls);

                    messagingTemplate.convertAndSend("/topic/messages/" + messageRequest.getReceiverId(), wsFileMessage);
                    messagingTemplate.convertAndSend("/topic/messages/" + messageRequest.getSenderId(), wsFileMessage);
                    log.info("WebSocket message sent for all files");

                    // καθαρίζουμε τη λίστα για το επόμενο batch
                    allFileUrls.clear();

                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Failed to serialize all file URLs to JSON", e);
                }
            }
        }
    }
    

    @Override
    public List<ChatSummaryResponse> getUserChats(Long userId) {
        List<Chat> chats = chatRepository.findAllByUserId(userId);

        return chats.stream()
                .map(chat -> {
                    Long senderId = chat.getParticipant1Id();
                    Long receiverId = chat.getParticipant2Id();

                    if (receiverId.equals(userId)) {
                        Long tmp = senderId;
                        senderId = receiverId;
                        receiverId = tmp;
                    }

                    Message lastMessage = chat.getLastMessageId() != null
                            ? messageRepository.findById(chat.getLastMessageId()).orElse(null)
                            : null;

                    LocalDateTime lastUpdated = lastMessage != null ? lastMessage.getTimestamp() : null;
                    String lastMessageContent = lastMessage != null
                            ? getMessagePreview(lastMessage)
                            : null;

                    return ChatSummaryResponse.builder()
                            .chatId(chat.getId())
                            .senderId(senderId)
                            .receiverId(receiverId)
                            .itemId(chat.getItemId())
                            .lastMessage(lastMessageContent)
                            .lastUpdated(lastUpdated)
                            .build();
                })
                .sorted(Comparator.comparing(
                        ChatSummaryResponse::lastUpdated,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();
    }

    @Override
    @Transactional
    public List<MessageResponse> getChatMessages(Long chatId, Long userId) {

        messageRepository.markMessagesAsRead(chatId, userId);
        List<Message> messages = messageRepository.findAllByChatIdOrderByTimestampAsc(chatId);

        return messages.stream().map(msg -> {
            UserSnapshot senderSnapshot = userSnapshotRepository.findById(msg.getSenderId())
                    .orElseThrow(() -> new RuntimeException(
                            "UserSnapshot not found for userId=" + msg.getSenderId()));

            String previewContent = getMessagePreview(msg); // preview side bar chat msgs
            String payload = null;

            // If it's offer type, payload is the actual offer amount or order info
            // Or if it's media then JSON string for media urls
            if (msg.getMessageType() != MessageType.TEXT) {
                payload = msg.getContent();
            }

            return new MessageResponse(
                    msg.getId(),
                    senderSnapshot.getUserId(),
                    senderSnapshot.getAvatarUrl(),
                    previewContent,
                    msg.getMessageType().name(),
                    payload,
                    msg.isReadByReceiver(),
                    msg.getTimestamp()
            );
        }).toList();
    }

    @Override
    @Transactional
    public void deleteChatForUser(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        if (Objects.equals(chat.getParticipant1Id(), userId)) {
            chat.setParticipant1Left(true);
        } else if (Objects.equals(chat.getParticipant2Id(), userId)) {
            chat.setParticipant2Left(true);
        } else {
            throw new AccessDeniedException("User is not a participant of this chat");
        }


        if (chat.isParticipant1Left() && chat.isParticipant2Left()) {
            messageRepository.deleteByChatId(chat.getId());
            chatRepository.delete(chat);
        } else {
            chatRepository.save(chat);
        }
    }

    @Override
    public byte[] loadImage(Long chatId, String filename) {
        try {
            Path storageLocation = fileStorageService.getStorageLocation()
                    .resolve(String.valueOf(chatId));
            Path resolvedPath = storageLocation.resolve(filename).normalize();

            return Files.readAllBytes(resolvedPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read image file: " + filename, e);
        }
    }

    @Override
    @Transactional
    public WebSocketMessage sendMessage(WebSocketMessageRequest request) {
        MessageRequest messageReq = request.getMessage();
        if (messageReq == null) {
            throw new IllegalArgumentException("MessageRequest cannot be null");
        }

        Message message = saveMessageAndUpdateChat(messageReq, MessageType.TEXT, null);
        return buildWebSocketMessage(message, null);
    }

    @Override
    @Transactional
    public ChatSummaryResponse initChat(MessageRequest request) {

        // Search for existing or create new chat
        Chat chat = chatRepository.findByParticipantsAndItem(
                request.getSenderId(),
                request.getReceiverId(),
                request.getItemId()
        ).orElseGet(() -> chatRepository.save(
                new Chat(request.getSenderId(), request.getReceiverId(), request.getItemId())
        ));

        List<UserSnapshot> snapshots = List.of(
                UserSnapshot.builder()
                        .userId(request.getSenderId())
                        .avatarUrl(request.getSenderAvatar())
                        .build(),
                UserSnapshot.builder()
                        .userId(request.getReceiverId())
                        .avatarUrl(request.getReceiverAvatar())
                        .build()
        );
        snapshots.forEach(s -> log.info("Saving UserSnapshot: userId={}, avatarUrl={}", s.getUserId(), s.getAvatarUrl()));
        userSnapshotRepository.saveAll(snapshots);

        // Save the message in DB and update chat with last msgId
        Message savedMessage = saveMessageAndUpdateChat(request, MessageType.TEXT, null);

        ChatSummaryResponse response = ChatSummaryResponse.builder()
                .chatId(chat.getId())
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .itemId(chat.getItemId())
                .lastMessage(savedMessage.getContent())
                .lastUpdated(savedMessage.getTimestamp())
                .build();

        InitChatWebSocketMessage webSocketMessage = InitChatWebSocketMessage.builder()
                .chatSummaryResponse(response)
                .senderUsername(request.getSenderUsername())
                .senderAvatarUrl(request.getSenderAvatar())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/new-chat/" + request.getReceiverId(),
                webSocketMessage
        );

        return response;
    }

    private Message saveMessageAndUpdateChat(MessageRequest messageReq, MessageType type, String storedUrls) {

        Chat chat = chatRepository.findByParticipantsAndItem(
                messageReq.getSenderId(),
                messageReq.getReceiverId(),
                messageReq.getItemId()
        ).orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        validateOffer(messageReq, chat);

        // if the MessageType == MEDIA we want the file urls to sent
        String content = type == MessageType.TEXT
                ? messageReq.getContent()
                : storedUrls;

        Message.MessageBuilder messageBuilder = Message.builder()
                .chat(chat)
                .senderId(messageReq.getSenderId())
                .content(content)
                .messageType(messageReq.getMessageType())
                .timestamp(LocalDateTime.now());

        // if msg is OFFER_REJECTED or OFFER_ACCEPTED, close the initial OFFER
        if (messageReq.getMessageType() == MessageType.OFFER_REJECTED || messageReq.getMessageType() == MessageType.OFFER_ACCEPTED) {

            messageRepository.findFirstByChatAndMessageTypeOrderByTimestampDesc(chat, MessageType.OFFER)
                    .ifPresentOrElse(offerMsg -> {
                        log.info("Found OPEN OFFER message with id {} and previewContent '{}'", offerMsg.getId(), offerMsg.getContent());

                        offerMsg.setMessageType(MessageType.OFFER_CLOSED);
                        messageRepository.save(offerMsg);

                        log.info("Updated message id {} to OFFER_CLOSED", offerMsg.getId());

                    }, () -> log.info("No OPEN OFFER message found for chat id {}", chat.getId()));
        }

        Message message = messageBuilder.build();
        messageRepository.save(message);

        chat.setLastMessageId(message.getId());
        chatRepository.save(chat);

        return message;
    }

    private void validateOffer(MessageRequest messageReq, Chat chat) {
        if (messageReq.getMessageType() == MessageType.OFFER) {
            boolean hasActiveOffer = messageRepository
                    .findFirstByChatAndMessageTypeOrderByTimestampDesc(chat, MessageType.OFFER)
                    .isPresent();

            if (hasActiveOffer) {
                throw new OfferActiveException("An active offer already exists for this chat.");
            }
        }
    }


    private WebSocketMessage buildWebSocketMessage(Message message, List<String> fileUrls) {

        UserSnapshot senderSnapshot = userSnapshotRepository
                .findById(message.getSenderId())
                .orElse(new UserSnapshot(message.getSenderId(), "/default/avatar.png"));

        String previewContent =
                message.getMessageType() == MessageType.MEDIA
                        ? getMediaPreview(fileUrls)
                        : getMessagePreview(message);

        Object payload =
                message.getMessageType() == MessageType.MEDIA
                        ? fileUrls
                        : message.getContent();

        MessageResponse response = MessageResponse.builder()
                .id(message.getId())
                .userId(senderSnapshot.getUserId())
                .avatarUrl(senderSnapshot.getAvatarUrl())
                .previewContent(previewContent)
                .type(message.getMessageType().name())
                .payload(payload)
                .isReadByReceiver(message.isReadByReceiver())
                .timestamp(message.getTimestamp())
                .build();

        return WebSocketMessage.builder()
                .chatId(message.getChat().getId())
                .messageResponse(response)
                .build();
    }

    private String getMessagePreview(Message message) {
        if (message.getMessageType() == MessageType.MEDIA && message.getContent() != null) {
            try {
                // parse JSON string to List<String>
                ObjectMapper mapper = new ObjectMapper();
                List<String> fileUrls = mapper.readValue(message.getContent(), List.class);
                return getMediaPreview(fileUrls);
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse file URLs JSON for messageId={}: {}", message.getId(), e.getMessage());
            }
        }

        return switch (message.getMessageType()) {
            case OFFER -> "💰 New Offer at " + message.getContent() + " €";
            case COUNTER_OFFER -> "💡 Counter Offer: " + message.getContent() + " €";
            case OFFER_ACCEPTED -> "✅ Offer Accepted";
            case OFFER_REJECTED -> "❌ Offer Rejected";
            default -> message.getContent();
        };
    }

    private String getMediaPreview(List<String> fileUrls) {
        long images = fileUrls.stream().filter(this::isImage).count();
        long videos = fileUrls.stream().filter(this::isVideo).count();

        if (images > 0 && videos == 0) return images == 1 ? "📷 Photo" : "📷 " + images + " Photos";
        if (videos > 0 && images == 0) return videos == 1 ? "📹 Video" : "📹 " + videos + " Videos";
        return "📷📹 Media";
    }

    private boolean isImage(String file) {
        String f = file.toLowerCase();
        return f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png");
    }

    private boolean isVideo(String file) {
        String f = file.toLowerCase();
        return f.endsWith(".mp4") || f.endsWith(".webm");
    }
}
