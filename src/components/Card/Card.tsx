import {
  useState,
  type KeyboardEvent,
  type DragEvent,
  type MouseEvent,
  type ChangeEvent,
  useEffect,
  type FocusEvent,
} from "react";
import { useCustomDispatch, useCustomSelector } from "../../store/hooks";

import styles from "./styles/card.module.scss";

import {
  addTask,
  clearDragInfoTask,
  editCardTitle,
  moveCard,
  moveTask,
  type ICard,
  type ITask,
} from "../../store/cardSlice";

import CardItem from "../CardItem/CardItem";
import CardMenu from "./CardMenu";

function Card({ cardId, title, tasks }: ICard) {
  const [visibleTasks, setVisibleTasks] = useState<ITask[]>(tasks);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddetingCardTitle, setIsAddetingCardTitle] = useState(false);
  const [editingCardTitle, setEditingCardTitle] = useState(title);
  const [isVisibleCardMenu, setIsVisibleCardMenu] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useCustomDispatch();
  const { sourceTaskId, sourceCardId } = useCustomSelector(
    (store) => store.cards.dragInfo
  );

  useEffect(() => {
    setVisibleTasks(tasks);
  }, [tasks]);

  const tasksId = tasks.map((task) => task.id);
  function smartSearchTasks(tasks: ITask[], query: string) {
    const terms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.trim().length > 0);

    if (terms.length === 0) {
      setVisibleTasks(tasks);
      return;
    }

    const filtredTasks = tasks.filter((task) => {
      const haystack = `${task.title} ${task.description}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });

    setVisibleTasks(filtredTasks);
  }
  function toggleCardMenu() {
    setIsVisibleCardMenu((prevState) => !prevState);
  }

  function handleAddTask() {
    setIsAddingTask(true);
  }

  function handleEditCardTitle(event: MouseEvent<HTMLHeadingElement>) {
    event.stopPropagation();
    setIsAddetingCardTitle(true);
  }

  function handleUpdateCardTitle(event: ChangeEvent<HTMLInputElement>) {
    setEditingCardTitle(event.target.value);
  }

  function handleBlurTitleInput() {
    setIsAddetingCardTitle(false);
    dispatch(editCardTitle({ cardId, title: editingCardTitle }));
  }

  function handleBlurAddTask(event: FocusEvent<HTMLElement>) {
    const related = event.relatedTarget as HTMLElement | null;
    if (related && event.currentTarget.contains(related)) {
      return;
    }

    if (taskTitle.trim().length > 0 && description.trim().length > 0) {
      dispatch(addTask({ cardId, title: taskTitle, description: description }));
    }
    setIsAddingTask(false);
  }

  function handlePressEnter(event: KeyboardEvent) {
    if (
      event.key === "Enter" &&
      taskTitle.length > 0 &&
      description.length > 0
    ) {
      setIsAddingTask(false);
      dispatch(addTask({ cardId, title: taskTitle, description: description }));
    }
  }

  function dragStartHandler(event: DragEvent<HTMLElement>) {
    event.stopPropagation();

    const dragType = event.dataTransfer.getData("type");

    if (dragType === "task") {
      return;
    }

    event.dataTransfer.setData("type", "card");
    event.dataTransfer.setData("cardId", cardId);

    // event.currentTarget.classList.add(styles["card--dragging"]);
  }

  function dragOverHandler(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const dragType = event.dataTransfer.getData("type");
    if (dragType !== "card") return;
    event.currentTarget.classList.add(styles["card--dropping"]);
  }

  function dragLeaveHandler(event: DragEvent<HTMLElement>) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove(styles["card--dropping"]);
  }

  function dragEndHandler(event: DragEvent<HTMLElement>) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove(styles["card--dragging"]);
    target.classList.remove(styles["card--dropping"]);
  }

  function dropHandler(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove(styles["card--dropping"]);

    const draggedCardId = event.dataTransfer.getData("cardId");

    if (draggedCardId !== cardId) {
      dispatch(
        moveCard({
          sourceCardId: draggedCardId,
          targetCardId: cardId,
        })
      );
    }
  }

  return (
    <section
      className={styles["card"]}
      draggable
      onDrag={dragStartHandler}
      onDragStart={dragStartHandler}
      onDragLeave={dragLeaveHandler}
      onDragEnd={dragEndHandler}
      onDragOver={dragOverHandler}
      onDrop={dropHandler}>
      <div className={styles["card__header-container"]}>
        {!isAddetingCardTitle ? (
          <h2
            className={styles["card__title"]}
            onDoubleClick={handleEditCardTitle}>
            {title}
          </h2>
        ) : (
          <input
            type="text"
            placeholder="Title"
            onChange={handleUpdateCardTitle}
            value={editingCardTitle}
            autoFocus
            onBlur={handleBlurTitleInput}
          />
        )}

        <button
          className={styles["card__menu-button"]}
          onClick={toggleCardMenu}>
          ⋮
        </button>
        {isVisibleCardMenu && (
          <CardMenu
            cardId={cardId}
            tasksId={tasksId}
            onSetIsVisibleCardMenu={setIsVisibleCardMenu}
            onSetVisibleTasks={setVisibleTasks}
          />
        )}
      </div>
      {tasks.length > 0 && (
        <input
          type="text"
          className={styles["card__search-input"]}
          placeholder="I'am looking for..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            smartSearchTasks(tasks, e.target.value);
          }}
        />
      )}
      <ul
        className={styles["card__list"]}
        onDragOver={(event: DragEvent<HTMLUListElement>) =>
          event.preventDefault()
        }
        onDrop={(event: DragEvent<HTMLUListElement>) => {
          event.preventDefault();
          event.stopPropagation();

          if (!sourceTaskId || !sourceCardId) return;

          if (sourceCardId === cardId) return;

          dispatch(
            moveTask({
              targetCardId: cardId,
              targetTaskId: null,
              dropAbove: false,
            })
          );
          dispatch(clearDragInfoTask());
        }}>
        {visibleTasks.map((task) => (
          <CardItem
            key={task.id}
            cardId={cardId}
            id={task.id}
            title={task.title}
            description={task.description}
            onSetVisibleTasks={setVisibleTasks}
            status={task.status}
          />
        ))}
      </ul>
      {!isAddingTask ? (
        <div className={styles["card__addingTask"]}>
          <button
            className={styles["card__addingTask-button"]}
            onClick={handleAddTask}>
            Add Task
          </button>
        </div>
      ) : (
        <li
          className={styles["card__addingTask"]}
          onKeyDown={handlePressEnter}
          onBlur={handleBlurAddTask}>
          <input
            className={styles["card__input"]}
            type="text"
            placeholder="title"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            autoFocus
          />
          <input
            className={styles["card__input"]}
            type="text"
            placeholder="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </li>
      )}
    </section>
  );
}

export default Card;
