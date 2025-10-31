import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
    projects: []
}

const projectsSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        addProject: (state, action) => {
            const { name, due, status } = action.payload;
            state.projects.push({ id: nanoid(), name, due, status })
        },
        editProject: (state, action) => {
            const { id, name, due, status} = action.payload;
            const p = state.projects.find((x) => x.id === id);
            if (!p) return;
            if (name !== undefined) p.name = name;
            if (due !== undefined) p.due = due;
            if (status !== undefined) p.status = status;
        },
        removeProject: (state, action) => {
            state.projects = state.projects.filter((p) => p.id !== action.payload)
        },
    },
});

export const { addProject, editProject, removeProject } = projectsSlice.actions;
export default projectsSlice.reducer;