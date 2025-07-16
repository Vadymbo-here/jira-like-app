import { createPortal } from "react-dom";
import { useCustomDispatch, useCustomSelector } from "../../store/hooks";

import styles from "./styles/cardItemMenu.module.scss";
import { removeTask, transferTask } from "../../store/cardSlice";

type Props = {
  position: {
    top: number;
    left: number;
  } | null;
  cardId: string;
  taskId: string;
};

function CardItemMenu({ position, cardId, taskId }: Props) {
  const dispatch = useCustomDispatch();
  const cards = useCustomSelector((store) => store.cards.cards);

  const cardsOptions = cards.map((card) => ({
    title: card.title,
    cardId: card.cardId,
  }));

  function handleDeleteTask(cardId: string, taskId: string) {
    dispatch(removeTask({ cardId, taskId }));
  }

  function handleTransferTask(
    sourceCardId: string,
    targetCardId: string,
    taskId: string
  ) {
    dispatch(transferTask({ sourceCardId, targetCardId, taskId }));
  }

  return createPortal(
    <ul
      className={styles["container"]}
      style={{
        top: position!.top,
        left: position!.left,
      }}>
      {cardsOptions.length > 1 && (
        <>
          <li
            className={`${styles["container__item"]} ${styles["container__item--title"]}`}>
            Move to
          </li>
          {cardsOptions.map((cardOpt) => {
            if (cardOpt.cardId === cardId) return;
            return (
              <li
                key={cardOpt.cardId}
                className={styles["container__item"]}
                onClick={() =>
                  handleTransferTask(cardId, cardOpt.cardId, taskId)
                }>
                {cardOpt.title}
              </li>
            );
          })}
        </>
      )}
      <li
        className={`${styles["container__item"]} ${styles["container__item--delete"]}`}
        role="button"
        onClick={() => handleDeleteTask(cardId, taskId)}>
        DELETE
      </li>
    </ul>,
    document.body
  );
}

export default CardItemMenu;
