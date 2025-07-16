import { type Dispatch, type SetStateAction } from "react";

import { changeStatus, type ITask } from "../../store/cardSlice";
import { useCustomDispatch, useCustomSelector } from "../../store/hooks";

import styles from "./styles/changeStatus.module.scss";
import { createPortal } from "react-dom";

type ChangeStatusProps = {
  cardId: string;
  taskId: string | string[];
  onSetVisbleChangeMenu: (param: boolean) => void;
  onSetVisibleTasks?: Dispatch<SetStateAction<ITask[]>>;
};

function ChangeStatus({
  cardId,
  taskId,
  onSetVisbleChangeMenu,
  onSetVisibleTasks,
}: ChangeStatusProps) {
  const dispatch = useCustomDispatch();
  const card = useCustomSelector((store) => store.cards.cards).find(
    (card) => card.cardId === cardId
  );

  function handleChangeStatus(
    cardId: string,
    taskId: string | string[],
    status: "todo" | "inProgress" | "done"
  ) {
    if (onSetVisibleTasks) {
      const filteredTasks = card?.tasks.filter(
        (task) => task.status === status
      );
      onSetVisibleTasks(filteredTasks!);
    } else {
      if (!Array.isArray(taskId)) {
        dispatch(changeStatus({ status, cardId, taskId }));
      } else {
        for (let i = 0; i < taskId.length; i++) {
          dispatch(changeStatus({ cardId, taskId: taskId[i], status }));
        }
      }
    }
    onSetVisbleChangeMenu(false);
  }

  function handleClearFilter() {
    if (!onSetVisibleTasks) return;
    onSetVisibleTasks(card!.tasks);
  }

  return (
    <div className={styles["status-container"]}>
      <ul className={styles["status-container__list"]}>
        <li
          className={`${styles["status-container__list-item"]} ${styles["status-container__list-item--todo"]}`}
          onClick={() => handleChangeStatus(cardId, taskId, "todo")}>
          To do
        </li>
        <li
          className={`${styles["status-container__list-item"]}  ${styles["status-container__list-item--inProgress"]}`}
          onClick={() => handleChangeStatus(cardId, taskId, "inProgress")}>
          In Progress
        </li>
        <li
          className={`${styles["status-container__list-item"]} ${styles["status-container__list-item--done"]}`}
          onClick={() => handleChangeStatus(cardId, taskId, "done")}>
          Done
        </li>
        {onSetVisibleTasks && (
          <li
            className={`${styles["status-container__list-item"]} ${styles["status-container__list-item--clear"]}`}
            onClick={handleClearFilter}>
            clear Filter
          </li>
        )}
      </ul>
    </div>
  );
}

export default ChangeStatus;
