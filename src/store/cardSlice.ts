import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "inProgress" | "done";
}
export interface ICard {
  cardId: string;
  title: string;
  tasks: ITask[];
}

const initialState: {
  cards: ICard[];
  dragInfo: {
    sourceCardId: string | null;
    sourceTaskId: string | null;
  };
} = {
  cards: [
    {
      cardId: "card1",
      title: "card1",
      tasks: [
        {
          id: "t1",
          title: "task 1",
          description: "task 1",
          status: "todo",
        },
        {
          id: "t2",
          title: "task 2",
          description: "task 2",
          status: "todo",
        },
        {
          id: "t3",
          title: "task 3",
          description: "task 3",
          status: "inProgress",
        },
        {
          id: "t4",
          title: "task 4",
          description: "task 4",
          status: "inProgress",
        },
        {
          id: "t5",
          title: "task 5",
          description: "task 5",
          status: "done",
        },
        {
          id: "t6",
          title: "task 6",
          description: "task 6",
          status: "done",
        },
      ],
    },
    {
      cardId: "card2",
      title: "card2",
      tasks: [
        {
          id: "t1 c2",
          title: "task 1",
          description: "task 1 c2",
          status: "todo",
        },
        {
          id: "t2 c2",
          title: "task 2",
          description: "task 2 c2",
          status: "todo",
        },
        {
          id: "t3 c2",
          title: "task 3",
          description: "task 3 c2",
          status: "inProgress",
        },
        {
          id: "t4 c2",
          title: "task 4",
          description: "task 4 c2",
          status: "inProgress",
        },
        {
          id: "t5 c2",
          title: "task 5",
          description: "task 5 c2",
          status: "done",
        },
        {
          id: "t6 c2",
          title: "task 6",
          description: "task 6 c2",
          status: "done",
        },
      ],
    },
  ],
  dragInfo: {
    sourceCardId: null,
    sourceTaskId: null,
  },
};

function loadFromLocalStorage(): typeof initialState {
  try {
    const data = localStorage.getItem("kanbanState");
    return data ? JSON.parse(data) : initialState;
  } catch (error) {
    console.error("Load error:", error);
    return initialState;
  }
}

function saveToLocalStorage(state: typeof initialState) {
  try {
    localStorage.setItem("kanbanState", JSON.stringify(state));
  } catch (error) {
    console.error("Save error:", error);
  }
}

const cardSlice = createSlice({
  name: "card",
  initialState: loadFromLocalStorage(),
  reducers: {
    addCard(state) {
      const cardId = new Date().toString() + Math.random().toString();
      state.cards.push({ cardId, title: "This is Card", tasks: [] });
      saveToLocalStorage(state);
    },
    editCardTitle(
      state,
      action: PayloadAction<{ cardId: string; title: string }>
    ) {
      const cardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.cardId
      );
      state.cards[cardIndex].title = action.payload.title;
      saveToLocalStorage(state);
    },
    removeCard(state, action: PayloadAction<string>) {
      const index = state.cards.findIndex(
        (card) => card.cardId === action.payload
      );
      if (index !== -1) {
        state.cards.splice(index, 1);
      }
      saveToLocalStorage(state);
    },
    addTask(
      state,
      action: PayloadAction<{
        cardId: string;
        title: string;
        description: string;
      }>
    ) {
      const id = new Date().toString() + Math.random().toString();
      const cardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.cardId
      );
      state.cards[cardIndex].tasks.push({
        id,
        title: action.payload.title,
        description: action.payload.description,
        status: "todo",
      });
      saveToLocalStorage(state);
    },
    removeTask(
      state,
      action: PayloadAction<{ cardId: string; taskId: string }>
    ) {
      const cardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.cardId
      );
      const taskIndex = state.cards[cardIndex].tasks.findIndex(
        (task) => task.id === action.payload.taskId
      );
      state.cards[cardIndex].tasks.splice(taskIndex, 1);
      saveToLocalStorage(state);
    },
    editTask(
      state,
      action: PayloadAction<{
        cardId: string;
        id: string;
        title?: string;
        description?: string;
      }>
    ) {
      const cardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.cardId
      );
      const taskIndex = state.cards[cardIndex].tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (action.payload.title) {
        state.cards[cardIndex].tasks[taskIndex].title = action.payload.title;
      }
      if (action.payload.description) {
        state.cards[cardIndex].tasks[taskIndex].description =
          action.payload.description;
      }
      saveToLocalStorage(state);
    },
    changeStatus(
      state,
      action: PayloadAction<{
        cardId: string;
        taskId: string;
        status: "todo" | "inProgress" | "done";
      }>
    ) {
      const cardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.cardId
      );
      const taskIndex = state.cards[cardIndex].tasks.findIndex(
        (task) => task.id === action.payload.taskId
      );
      state.cards[cardIndex].tasks[taskIndex].status = action.payload.status;
      saveToLocalStorage(state);
    },
    sortTasksByStatus: (state, action: PayloadAction<{ cardId: string }>) => {
      const cardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.cardId
      );

      const statusOrder: ITask["status"][] = ["todo", "inProgress", "done"];

      state.cards[cardIndex].tasks.sort((a, b) => {
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });
      saveToLocalStorage(state);
    },
    setDragInfoTask(
      state,
      action: PayloadAction<{ sourceCardId: string; sourceTaskId: string }>
    ) {
      state.dragInfo = action.payload;
      saveToLocalStorage(state);
    },
    clearDragInfoTask(state) {
      state.dragInfo = { sourceCardId: null, sourceTaskId: null };
      saveToLocalStorage(state);
    },
    moveTask(
      state,
      action: PayloadAction<{
        targetCardId: string;
        targetTaskId: string | null;
        dropAbove: boolean;
      }>
    ) {
      const { sourceCardId, sourceTaskId } = state.dragInfo;

      const sourceCardIndex = state.cards.findIndex(
        (card) => card.cardId === sourceCardId
      );
      if (sourceCardIndex === -1) return;

      const sourceTaskIndex = state.cards[sourceCardIndex].tasks.findIndex(
        (task) => task.id === sourceTaskId
      );
      if (sourceTaskIndex === -1) return;

      const sourceTask = state.cards[sourceCardIndex].tasks[sourceTaskIndex];
      state.cards[sourceCardIndex].tasks.splice(sourceTaskIndex, 1);

      const targetCardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.targetCardId
      );
      if (targetCardIndex === -1) return;

      if (action.payload.targetTaskId === null) {
        state.cards[targetCardIndex].tasks.push(sourceTask);
      } else {
        const targetTaskIndex = state.cards[targetCardIndex].tasks.findIndex(
          (task) => task.id === action.payload.targetTaskId
        );
        if (targetTaskIndex === -1) {
          state.cards[targetCardIndex].tasks.push(sourceTask);
        } else {
          const insertIndex = action.payload.dropAbove
            ? targetTaskIndex
            : targetTaskIndex + 1;
          state.cards[targetCardIndex].tasks.splice(insertIndex, 0, sourceTask);
        }
      }
      saveToLocalStorage(state);
    },
    transferTask(
      state,
      action: PayloadAction<{
        sourceCardId: string;
        targetCardId: string;
        taskId: string;
      }>
    ) {
      const sourceCardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.sourceCardId
      );
      const targetCardIndex = state.cards.findIndex(
        (card) => card.cardId === action.payload.targetCardId
      );
      const taskIndex = state.cards[sourceCardIndex].tasks.findIndex(
        (task) => task.id === action.payload.taskId
      );
      state.cards[targetCardIndex].tasks.unshift(
        state.cards[sourceCardIndex].tasks[taskIndex]
      );
      state.cards[sourceCardIndex].tasks.splice(taskIndex, 1);
      saveToLocalStorage(state);
    },
    moveCard(
      state,
      action: PayloadAction<{
        sourceCardId: string;
        targetCardId: string | null;
      }>
    ) {
      const { sourceCardId, targetCardId } = action.payload;

      const sourceIndex = state.cards.findIndex(
        (card) => card.cardId === sourceCardId
      );
      const targetIndex = state.cards.findIndex(
        (card) => card.cardId === targetCardId
      );
      if (sourceIndex === -1) return;

      const [sourceCard] = state.cards.splice(sourceIndex, 1);

      if (targetCardId === null) {
        state.cards.push(sourceCard);
        return;
      }

      if (targetIndex === -1) {
        state.cards.push(sourceCard);
        return;
      }

      state.cards.splice(targetIndex, 0, sourceCard);
      saveToLocalStorage(state);
    },
  },
});

export default cardSlice.reducer;

export const {
  addCard,
  editCardTitle,
  removeCard,
  addTask,
  removeTask,
  transferTask,
  editTask,
  changeStatus,
  sortTasksByStatus,
  setDragInfoTask,
  clearDragInfoTask,
  moveTask,
  moveCard,
} = cardSlice.actions;
