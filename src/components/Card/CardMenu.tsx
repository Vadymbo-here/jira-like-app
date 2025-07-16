import { useState, type Dispatch, type SetStateAction } from "react";
import {
  removeCard,
  sortTasksByStatus,
  type ITask,
} from "../../store/cardSlice";
import { useCustomDispatch, useCustomSelector } from "../../store/hooks";
import ChangeStatus from "../CardItem/ChangeStatus";
import styles from "./styles/cardMenu.module.scss";

type CardMenuProps = {
  cardId: string;
  tasksId: string[];
  onSetIsVisibleCardMenu: (param: boolean) => void;
  onSetVisibleTasks: Dispatch<SetStateAction<ITask[]>>;
};

function CardMenu({
  cardId,
  tasksId,
  onSetIsVisibleCardMenu,
  onSetVisibleTasks,
}: CardMenuProps) {
  const [isVisibleChangeStatus, setIsVisibleChangeStatus] = useState(false);

  const [isTaskFilterMenuVisible, setIsTaskFilterMenuVisible] = useState(false);

  const dispatch = useCustomDispatch();

  function handleDeleteCard(cardId: string) {
    dispatch(removeCard(cardId));
  }

  function handlesSetVisibleSetTask() {
    setIsVisibleChangeStatus(false);
    setIsTaskFilterMenuVisible((prevState) => !prevState);
  }

  function handleSelectAllTasks(idsArr: string[]) {
    setIsTaskFilterMenuVisible(false);
    setIsVisibleChangeStatus((prevState) => !prevState);
  }

  function handleSortTasks(cardId: string) {
    dispatch(sortTasksByStatus({ cardId }));
    onSetIsVisibleCardMenu(false);
  }

  return (
    <div className={styles["card-menu"]}>
      <ul className={styles["card-menu__list"]}>
        <li
          className={styles["card-menu__item"]}
          onClick={() => handleSelectAllTasks(tasksId)}>
          Select All
        </li>
        {isVisibleChangeStatus && (
          <li className={`${styles["card-menu__change-status"]}`}>
            <ChangeStatus
              cardId={cardId}
              taskId={tasksId}
              onSetVisbleChangeMenu={setIsVisibleChangeStatus}
            />
          </li>
        )}
        <li
          className={styles["card-menu__item"]}
          onClick={() => handleSortTasks(cardId)}>
          Sort
        </li>
        <li
          className={styles["card-menu__item"]}
          onClick={handlesSetVisibleSetTask}>
          Filter
          <li className={styles["card-menu__filter"]}>
            {isTaskFilterMenuVisible && (
              <ChangeStatus
                cardId={cardId}
                taskId={tasksId}
                onSetVisbleChangeMenu={setIsVisibleChangeStatus}
                onSetVisibleTasks={onSetVisibleTasks}
              />
            )}
          </li>
        </li>
        <li
          className={`${styles["card-menu__item"]} ${styles["card-menu__item--delete"]}`}
          onClick={() => handleDeleteCard(cardId)}>
          DELETE
        </li>
      </ul>
    </div>
  );
}

export default CardMenu;
