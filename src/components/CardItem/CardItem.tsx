import styles from "./styles/cardItem.module.scss";

import {
  clearDragInfoTask,
  editTask,
  moveTask,
  setDragInfoTask,
  type ITask,
} from "../../store/cardSlice";
import {
  useState,
  type KeyboardEvent,
  type DragEvent,
  type Dispatch,
  type SetStateAction,
  useRef,
} from "react";
import { useCustomDispatch, useCustomSelector } from "../../store/hooks";
import ChangeStatus from "./ChangeStatus";
import CardItemMenu from "./CardItemMenu";

type CardItemProps = {
  cardId: string;
  onSetVisibleTasks: Dispatch<SetStateAction<ITask[]>>;
} & ITask;

function CardItem({ cardId, id, title, description, status }: CardItemProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [isVisibleCardMenu, setIsVisibleCardMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  const [isVisibleChangeMenu, setIsVisibleChangeMenu] = useState(false);

  const dispatch = useCustomDispatch();

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    dispatch(editTask({ cardId, id, title: editedTitle }));
  };
  const handleDescBlur = () => {
    setIsEditingDescription(false);
    dispatch(editTask({ cardId, id, description: editedDescription }));
  };

  function handleTitleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      setIsEditingTitle(false);
      dispatch(editTask({ cardId, id, title: editedTitle }));
    }
  }

  function handleDescKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      setIsEditingDescription(false);
      dispatch(editTask({ cardId, id, description: editedDescription }));
    }
  }

  // DRAG & DROP
  function dragStartHandler(
    event: DragEvent<HTMLLIElement>,
    taskId: string,
    cardId: string
  ) {
    event.stopPropagation();
    event.dataTransfer.setData("type", "task");
    event.dataTransfer.setData("sourceTaskId", taskId);
    event.dataTransfer.setData("sourceCardId", cardId);
    dispatch(setDragInfoTask({ sourceTaskId: taskId, sourceCardId: cardId }));
  }

  function dragLeaveHandler(event: DragEvent<HTMLLIElement>) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove(styles["cardItem--dropping"]);
  }

  function dragEndHandler(event: DragEvent<HTMLLIElement>) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove(styles["cardItem--dropping"]);
  }

  function dragOverHandler(
    event: DragEvent<HTMLLIElement>,
    taskId: string,
    cardId: string
  ) {
    // event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.add(styles["cardItem--dropping"]);
  }

  function dropHandler(
    event: DragEvent<HTMLLIElement>,
    taskId: string,
    cardId: string
  ) {
    // event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove(styles["cardItem--dropping"]);

    const rect = target.getBoundingClientRect();
    const mouseY = event.clientY;
    const elementHeight = rect.height;

    const dropAbove = mouseY <= rect.top + elementHeight / 2;

    if (taskId && cardId) {
      dispatch(
        moveTask({
          targetCardId: cardId,
          targetTaskId: taskId,
          dropAbove,
        })
      );
      dispatch(clearDragInfoTask());
    }
  }

  return (
    <li
      className={styles["cardItem"]}
      draggable={true}
      onDragStart={(event: DragEvent<HTMLLIElement>) => {
        dragStartHandler(event, id, cardId);
      }}
      onDragLeave={(event: DragEvent<HTMLLIElement>) => {
        dragLeaveHandler(event);
      }}
      onDragEnd={(event: DragEvent<HTMLLIElement>) => {
        dragEndHandler(event);
      }}
      onDragOver={(event: DragEvent<HTMLLIElement>) => {
        dragOverHandler(event, id, cardId);
      }}
      onDrop={(event: DragEvent<HTMLLIElement>) => {
        dropHandler(event, id, cardId);
      }}>
      <div className={styles["cardItem__content"]}>
        {isEditingTitle ? (
          <input
            className={styles["cardItem__input"]}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h2
            className={styles["cardItem__title"]}
            onDoubleClick={(event) => {
              event.stopPropagation();
              setIsEditingTitle(true);
            }}>
            {editedTitle}
          </h2>
        )}
        {isEditingDescription ? (
          <textarea
            className={styles["cardItem__textarea"]}
            value={editedDescription}
            onChange={(event) => setEditedDescription(event.target.value)}
            onBlur={handleDescBlur}
            onKeyDown={handleDescKeyDown}
          />
        ) : (
          <p
            className={styles["cardItem__description"]}
            onDoubleClick={(event) => {
              event.stopPropagation();
              setIsEditingDescription(true);
            }}>
            {editedDescription}
          </p>
        )}
      </div>
      <div className={styles["cardItem__navigation"]}>
        <button
          className={`${styles["cardItem__status"]} ${
            styles[`cardItem__status--${status}`]
          }`}
          onClick={() => {
            setIsVisibleChangeMenu(true);
            const rect = menuButtonRef.current?.getBoundingClientRect();
            if (rect) {
              setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
              });
            }
            console.log(menuPosition);
          }}>
          {status}
        </button>
        {isVisibleChangeMenu && (
          <div className={styles["cardItem__change-status-container"]}>
            <ChangeStatus
              cardId={cardId}
              taskId={id}
              onSetVisbleChangeMenu={setIsVisibleChangeMenu}
            />
          </div>
        )}
        <button
          ref={menuButtonRef}
          className={styles["cardItem__options-button"]}
          onClick={() => {
            setIsVisibleCardMenu((prev) => !prev);

            const rect = menuButtonRef.current?.getBoundingClientRect();
            if (rect) {
              setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
              });
            }
          }}>
          ⋮
        </button>
        {isVisibleCardMenu && (
          <CardItemMenu
            position={menuPosition}
            cardId={cardId}
            taskId={id}
          />
        )}
      </div>
    </li>
  );
}

export default CardItem;
