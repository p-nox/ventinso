import { useRef, useState, useEffect } from "react";
import styles from "./MultiImageUpload.module.css";
import { X, PlusCircle, RotateCw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useImagePreviews from "@hooks/useImagePreviews";

export default function MultiImageUpload({
  files,
  setFiles,
  thumbnail,
  setThumbnail = () => { },
  existingImages = [],
  setExistingImages = () => { },
}) {
  const inputRef = useRef(null);

  const {
    previews,
    thumbnailIndex,
    setThumbnailIndex,
    handleDelete,
  } = useImagePreviews(
    files,
    setFiles,
    existingImages,
    setExistingImages,
    thumbnail,
    setThumbnail
  );

  const openFilePicker = () => inputRef.current.click();

  const handleChange = (e) => {
    const maxFiles = 14;
    const maxSizeMB = 14;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const selected = Array.from(e.target.files);

    if (files.length + selected.length + existingImages.length > maxFiles) {
      alert(`You can upload up to ${maxFiles} files in total.`);
      e.target.value = "";
      return;
    }

    for (let file of selected) {
      if (file.size > maxSizeBytes) {
        alert(`${file.name} exceeds the limit of ${maxSizeMB}MB.`);
        e.target.value = "";
        return;
      }
    }

    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const handleThumbnailChange = (index) => {
    const combined = [...existingImages, ...files];
    const item = combined[index];
    setThumbnail(item instanceof File ? item.name : item);
    setThumbnailIndex(index);
  };

  /* ---------------- DND-KIT ---------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(previews.map((_, i) => i));
  }, [previews.length]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    const combined = [...existingImages, ...files];
    const [moved] = combined.splice(oldIndex, 1);
    combined.splice(newIndex, 0, moved);

    setExistingImages(combined.slice(0, existingImages.length));
    setFiles(combined.slice(existingImages.length));

    if (thumbnailIndex === oldIndex) setThumbnailIndex(newIndex);
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {previews.length === 0 ? (
        <div className={styles.emptyState} onClick={openFilePicker}>
          <PlusCircle className={styles.uploadIcon} />
          <p className={styles.uploadText}>Upload Photos</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={horizontalListSortingStrategy}
          >
            <div className={styles.previewsContainer}>
              <button
                type="button"
                className={styles.uploadButton}
                onClick={openFilePicker}
              >
                <PlusCircle className={styles.uploadIcon} />
              </button>


              {items.map((index) => (
                <SortablePreview
                  key={index}
                  index={index}
                  src={previews[index]}
                  thumbnailIndex={thumbnailIndex}
                  handleThumbnailChange={handleThumbnailChange}
                  handleDeletePreview={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

/* ================== SORTABLE ITEM ================== */
function SortablePreview({
  src,
  index,
  thumbnailIndex,
  handleThumbnailChange,
  handleDeletePreview,
}) {
  const [rotation, setRotation] = useState(0);

  // DnD-kit sortable hook
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const rotate = (e) => {
    e.stopPropagation(); // σταματάμε το bubbling στο parent
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.previewWrapper}
    >
      {/* Radio για thumbnail, stopPropagation */}
      <input
        type="radio"
        name="thumbnail"
        checked={thumbnailIndex === index}
        onChange={() => handleThumbnailChange(index)}
        className={styles.radioToggle}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Delete button */}
      <button
        type="button"
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          handleDeletePreview(index);
        }}
      >
        <X className={styles.deleteIcon} />
      </button>

      {/* Rotate button */}
      <button
        type="button"
        className={styles.rotateButton}
        onClick={(e) => rotate(e)}
      >
        <RotateCw className={styles.rotateIcon} />
      </button>

      {/* Image click για thumbnail */}
      <img
        src={src}
        alt={`preview-${index}`}
        className={styles.previewImage}
        style={{ transform: `rotate(${rotation}deg)` }}
        draggable={false}
        onClick={() => handleThumbnailChange(index)}
      />
    </div>
  );
}
