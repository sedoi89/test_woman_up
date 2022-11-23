import './App.css';
import {useEffect, useState} from "react";
import {Button, List} from "@mui/material";
import db from "./firebase";
import TaskWindow from "./modules/task-window";
import ModalWindow from './modules/modal-window'

/**
 *Основное окно рендера тасков и модального окна
 * @returns {JSX.Element}
 * @constructor
 */
function App() {
    const [toDo, setToDo] = useState([]);
    const [open, setOpen] = useState(null);

    /**
     * Функция для открытия модального окна и создания нового таска
     * @param e
     */
    function handleOpen  (e) {
        if (e) {
            setOpen('event');
            setTimeout(() => {
                setOpen(null);
            },100)

        }
    }

    useEffect(() => {
        console.log()
        db.collection('todos').onSnapshot(snapshot => {
            setToDo(snapshot.docs.map(doc => ({id: doc.id, todo: doc.data().todo})))
        })
    }, []);



    return (
        <div className={'App'}>
            <h1>ToDO Project</h1>
            <Button onClick={handleOpen}>New Task</Button>
            <ModalWindow isOpen={open}></ModalWindow>
            <List sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
                {toDo.map(i => {
                    return <TaskWindow key={i.todo.value} props={i}/>
                })}
            </List>
        </div>
    );
}

export default App;
