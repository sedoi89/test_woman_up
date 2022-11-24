import React, {useState} from 'react';
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterLuxon} from "@mui/x-date-pickers/AdapterLuxon";
import {Box, IconButton, TextField, Tooltip} from "@mui/material";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import {DateTime} from "luxon";
import DeleteIcon from "@mui/icons-material/Delete";
import db from "../firebase";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import StandaloneToggleButton from "./toggle-button";
import ListItem from "@mui/material/ListItem";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";

/**
 * Окно задачи с возможностью редактирования таска, загрузки файлов или удаления таска полностью
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const TaskWindow = (props) => {

    const now = DateTime.now();
    const [editingMode, setEditingMode] = useState(false);
    const [editingModeValue, setEditingModeValue] = useState('');
    const [editingModeDate, setEditingModeDate] = useState(null);
    const [editingDescription, setEditingDescription] = useState('');
    const storage = getStorage();

    /**
     * Функция для визуализации выполнения задачи
     * @returns {{borderColor: string}}
     */
    function taskVisualization() {
        if (props.props.todo.isDone) {
            return {borderColor: 'green', boxShadow: '0px 0px 20px -10px rgba(0,255,16,0.24)'}
        }
        if (props.props.todo.date < now.ts && !props.props.todo.isDone) {
            return {borderColor: 'red', boxShadow: '0px 0px 20px -10px rgba(255,18,18,0.13)'}
        }
        return {borderColor: 'yellow', boxShadow: '0px 0px 20px -10px rgba(233,255,20,0.13)'}
    }

    /**
     * Функция удаления прикрепленного к таску файла
     * @param e
     */
    function deleteFile(e) {

        if (e) {
            const fileRef = ref(storage, props.props.todo.file.fileName);
            deleteObject(fileRef).then(() => console.log('FileDeleted'));
            db.collection('todos').doc(props.props.id).set({
                todo: {
                    file: {
                        fileUrl: '',
                        fileName: ''
                    }
                }
            }, {merge: true})
        }
    }
    /**
     * Функция загрузки файла в storage если файл отсутствует
     * @param e
     * @returns {Promise<void>}
     */
    const onFileChange = async (e) => {
        const files = e.target.files[0];
        const fileRef = ref(storage, `${files.name}`);
        console.log(files)
        uploadBytes(fileRef, files).then(() => {
            getDownloadURL(fileRef).then(url => {
                console.log(url)
                db.collection('todos').doc(props.props.id).set({
                    todo: {
                        file: {
                            fileUrl: url,
                            fileName: files.name
                        }
                    }
                }, {merge: true})
                console.log(url)
            })

        })
    };

    /**
     * Функция загрузки файла из storage для локального использования
     * @param e
     */
    function downloadFile(e) {
        if (e) {
            window.open(props.props.todo.file.fileUrl, '_blank')
        }
    }

    return (
        /**
         * Карточка таска
         */
        <ListItem sx={taskVisualization(props)}>
            <ListItemAvatar>
                <Avatar>
                </Avatar>
            </ListItemAvatar>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', margin: '0 3px'}}>

                {
                    editingMode ? '' :
                        <ListItemText primary={props.props.todo.value} secondary={`Выполнить до: ${DateTime.fromMillis(
                            props.props.todo.date
                        ).toFormat('DD')} \n ${props.props.todo.file.fileName ? 'Файл:' : ''} ${props.props.todo.file.fileName.length > 10? props.props.todo.file.fileName.slice(0, 9) + '...' + props.props.todo.file.fileName.slice(props.props.todo.file.fileName.indexOf('.'), props.props.todo.file.fileName.length) : props.props.todo.file.fileName }`}/>
                }
                <ListItemText>
                    {editingMode ?
                        <TextField id="standard-basic" label="Task" variant="standard" value={editingModeValue}
                                   onChange={i => setEditingModeValue(i.target.value)}/> : ''}</ListItemText>
                {
                    /**
                     * В режиме редактирования меняются поля для изменения данных
                     */
                    editingMode ?
                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                            <DatePicker
                                mask="____/__/__"
                                value={editingModeDate}
                                onChange={(newValue) => {
                                    setEditingModeDate(newValue)
                                }}
                                renderInput={({inputRef, inputProps, InputProps}) => (
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <input ref={inputRef} {...inputProps}  placeholder={'Do you need new date?'}/>
                                        {InputProps?.endAdornment}
                                    </Box>
                                )}>
                            </DatePicker>
                        </LocalizationProvider> : ''
                }
                {
                    editingMode ? <TextField
                            id="outlined-multiline-static"
                            label="Task description"
                            multiline
                            rows={4}
                            defaultValue={editingDescription}
                            onChange={i => setEditingDescription(i.target.value)}
                        />
                        :
                        <ListItemText secondary={props.props.todo.description}></ListItemText>
                }
            </div>

            <div className={' icon-container'}>
                <Tooltip title={'Delete Task'}>
                    <DeleteIcon onClick={() => {
                        if (window.confirm('Удалить задачу?')) {
                            db.collection('todos').doc(props.props.id).delete()
                        }
                    }}/>
                </Tooltip>
                {
                    /**
                     * объединенные иконки меняются в зависимости от состояния, добавлены tooltips для удобства
                     */
                    editingMode ?
                        <div>
                            {props.props.todo.file.fileUrl !== '' ?
                                <Tooltip children={
                                    <FolderDeleteIcon onClick={deleteFile}/>
                                } title={'Delete file'}>
                                </Tooltip> :
                                <Tooltip children={
                                    <IconButton color="primary" aria-label="upload file" component="label">
                                        <input hidden accept="any" type="file" onChange={onFileChange}/>
                                        <UploadFileIcon/>
                                    </IconButton>
                                } title={'Upload file'}/>
                            }
                        </div>
                        :
                        ''
                }
                {
                    /**
                     * Иконка загрузки файла из storage
                     */
                    props.props.todo.file.fileUrl ? <Tooltip children={<FileDownloadIcon onClick={downloadFile}/>}
                                                          title={`Download file  ${props.props.todo.file.fileName}`}/> : ''}
                {
                    /**
                     * Данные которые записываются после внесенных изменений в базу
                     */
                    editingMode ?
                    <Tooltip children={<CheckIcon sx={{color: 'green'}} onClick={() => {
                        if (editingModeValue !== '' || editingModeDate !== null) {
                            db.collection('todos').doc(props.props.id).set({
                                todo: {
                                    value: editingModeValue,
                                    date: editingModeDate.ts ? editingModeDate.ts : editingModeDate,
                                    isDone: props.props.todo.isDone,
                                    description: editingDescription ? editingDescription : ''
                                }
                            }, {merge: true})
                        }
                        setEditingMode(!editingMode);
                    }}
                    />
                    }
                             title={'Confirm editing'}/>
                    :
                    <Tooltip children={<EditIcon onClick={() => {
                        setEditingMode(!editingMode);
                        setEditingModeValue(props.props.todo.value);
                        setEditingModeDate(props.props.todo.date);
                        setEditingDescription(props.props.todo.description);
                    }}
                    />
                    }
                             title={'Edit task'}/>
                }
                <StandaloneToggleButton value={props.props.todo.isDone} id={props.props.id}/>
            </div>
        </ListItem>
    );
};

export default TaskWindow;
