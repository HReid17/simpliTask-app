import { createSlice } from '@reduxjs/toolkit'
import { nanoid } from 'nanoid'

const initialState = {
    tasks: []
}

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        addTask: (state, action) => {
            state.tasks.push({
                id: nanoid(),
                name: action.payload.name,
                date: action.payload.date,
                project: action.payload.project,
                progress: action.payload.progress || 0,
            });
        },
        removeTask: (state, action) => {
            const id = action.payload;
            state.tasks = state.tasks.filter((t) => t.id !== id)
        },
        editTask: (state, action) => {
            const { id, field, value } = action.payload;
            const t = state.tasks.find((x) => x.id === id);
            if (t) t[field] = field === "progress" ? Number(value) || 0 : value;
        },
    }
});

export const { addTask, removeTask, editTask } = tasksSlice.actions;
export default tasksSlice.reducer;