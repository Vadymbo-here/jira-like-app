import { type DragEvent } from "react";

import Card from "./components/Card/Card";

import styles from "./app.module.scss";
import { useCustomDispatch, useCustomSelector } from "./store/hooks";
import { addCard, moveCard } from "./store/cardSlice";

function App() {
  const dispatch = useCustomDispatch();

  function handleAddCard() {
    dispatch(addCard());
  }

  function dragOverHandler(event: DragEvent<HTMLElement>) {
    event.preventDefault();
  }

  function dropHandler(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const draggedCardId = event.dataTransfer.getData("cardId");
    dispatch(
      moveCard({
        sourceCardId: draggedCardId,
        targetCardId: null, // null означает конец списка
      })
    );
    document.querySelectorAll(`.${styles["card"]}`).forEach((card) => {
      card.classList.remove(styles["card--dropping"]);
    });
  }
  const tasks = useCustomSelector((store) => store.cards.cards);
  return (
    <main className={styles["main"]}>
      <button
        className={styles["add-button"]}
        onClick={handleAddCard}>
        +<span className={styles["add-button__label"]}>Add Card</span>
      </button>
      {tasks.map((card) => (
        <Card
          key={card.cardId}
          title={card.title}
          cardId={card.cardId}
          tasks={card.tasks}
        />
      ))}
    </main>
  );
}

export default App;
