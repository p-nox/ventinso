package com.example.user_service.service.implementation;

import com.example.user_service.dto.RatingRequest;
import com.example.user_service.dto.RatingResponse;
import com.example.user_service.entity.Rating;
import com.example.user_service.entity.User;
import com.example.user_service.enums.RatingValue;
import com.example.user_service.event.RatingEvent;
import com.example.user_service.event.UserRatingUpdateEvent;
import com.example.user_service.repository.RatingRepository;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.utils.Mapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Mapper mapper;


    public RatingResponse getRatingForOrder(Long orderId){
        Rating rating = ratingRepository.findByOrderId(orderId);

        if (rating == null) {
            log.warn("No rating found for orderId={}", orderId);
            return null;
        }
        return RatingResponse.builder()
                .orderId(rating.getOrderId())
                .listingCondition(rating.getListingCondition().getScore())
                .listingPackaging(rating.getListingPackaging().getScore())
                .listingDescription(rating.getListingDescription().getScore())
                .comment(rating.getComment())
                .build();
    }


    @Transactional
    public void createRating(RatingRequest request) {
        List<User> users = userRepository.findByIds(List.of(request.getReviewerId(), request.getRevieweeId()));

        if (users.size() != 2) {
            throw new RuntimeException("Reviewer or Reviewee not found");
        }

        Map<Long, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        User reviewer = userMap.get(request.getReviewerId());
        User reviewee = userMap.get(request.getRevieweeId());

        int totalRating = (request.getListingDescription()
                + request.getListingPackaging()
                + request.getListingCondition()) / 3;

        Rating rating = Rating.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .orderId(request.getOrderId())
                .listingDescription(RatingValue.fromInt(request.getListingDescription()))
                .listingPackaging(RatingValue.fromInt(request.getListingPackaging()))
                .listingCondition(RatingValue.fromInt(request.getListingCondition()))
                .totalRating(totalRating)
                .comment(request.getComment())
                .build();

        Rating savedRating = ratingRepository.save(rating);


        updateUserAverages(reviewee, savedRating);
        userRepository.save(reviewee);

        // publish event for order service
        RatingEvent event = RatingEvent.builder()
                .orderId(savedRating.getOrderId())
                .reviewerId(savedRating.getReviewer().getId())
                .revieweeId(savedRating.getReviewee().getId())
                .build();

        kafkaTemplate.send("user.rating.submitted", event);

        // publish event for preview service
        UserRatingUpdateEvent updatedEvent = UserRatingUpdateEvent.builder()
                .userId(reviewee.getId())
                .avgOverallRating(reviewee.getAvgOverallRating())
                .totalRatings(reviewee.getTotalRatings())
                .build();
        kafkaTemplate.send("user.rating.updated", updatedEvent);
    }

    private void updateUserAverages(User user, Rating rating) {
        int count = user.getTotalRatings() == null ? 0 : user.getTotalRatings();

        user.setAvgDescriptionRating(
                ((user.getAvgDescriptionRating() == null ? 0 : user.getAvgDescriptionRating()) * count
                        + rating.getListingDescription().getScore()) / (count + 1)
        );

        user.setAvgPackagingRating(
                ((user.getAvgPackagingRating() == null ? 0 : user.getAvgPackagingRating()) * count
                        + rating.getListingPackaging().getScore()) / (count + 1)
        );

        user.setAvgConditionRating(
                ((user.getAvgConditionRating() == null ? 0 : user.getAvgConditionRating()) * count
                        + rating.getListingCondition().getScore()) / (count + 1)
        );

        double overall = (rating.getListingDescription().getScore()
                + rating.getListingPackaging().getScore()
                + rating.getListingCondition().getScore()) / 3.0;

        user.setAvgOverallRating(
                ((user.getAvgOverallRating() == null ? 0 : user.getAvgOverallRating()) * count + overall) / (count + 1)
        );

        user.setTotalRatings(count + 1);
    }

    public List<RatingResponse> getRatingsForUser(Long userId) {
        List<Rating> ratings = ratingRepository.findByRevieweeId(userId);

        return ratings.stream()
                .map(r -> {
                    RatingResponse response = new RatingResponse();
                    response.setOrderId(r.getOrderId());
                    response.setListingDescription(r.getListingDescription().getScore());
                    response.setListingPackaging(r.getListingPackaging().getScore());
                    response.setListingCondition(r.getListingCondition().getScore());
                    response.setComment(r.getComment());
                    response.setReviewerId(r.getReviewer().getId());
                    response.setReviewerUsername(r.getReviewer().getUsername()); //
                    response.setCreatedAt(r.getCreatedAt());
                    return response;
                })
                .toList();
    }


    public Double getAverageRatingForUser(Long userId) {
        List<Rating> ratings = ratingRepository.findByRevieweeId(userId);
        return ratings.stream()
                .mapToInt(Rating::getTotalRating)
                .average()
                .orElse(0.0);
    }
}
