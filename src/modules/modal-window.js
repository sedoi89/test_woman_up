import React, {useEffect, useState} from 'react';
import {Box, Button, TextField, Modal} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterLuxon} from "@mui/x-date-pickers/AdapterLuxon";
import db from "../firebase";
import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";


const ModalWindow = (props) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setValue] = useState('');
    const [date, setDate] = useState(null);
    const handleClose = () => setOpen(false);
    const [taskDescription, setTaskDescription] = useState('')
    const [fileUrl, setFileUrl] = useState(null);
    const [fileName, setFileName] = useState('')
    const storage = getStorage();

    useEffect(() => {if (props.isOpen === 'event') {
        setOpen(true)}
    },[props.isOpen])

    function handleSubmit(e) {
        e.preventDefault();
        db.collection('todos').add({
            todo: {
                value: inputValue,
                date: date.ts,
                isDone: false,
                description: taskDescription,
                file: {
                    fileUrl: fileUrl !== null ? fileUrl : '',
                    fileName: fileName
                }
            }
        });
        setValue('');
        setOpen(false);
        setTaskDescription('');
    }

    const onFileChange = async (e) => {
        const files = e.target.files[0];
        const fileRef = ref(storage, `${files.name}`);
        setFileName(files.name)
        uploadBytes(fileRef, files).then(() => {
            getDownloadURL(fileRef).then(url => {
                setFileUrl(url);
            })
        })
    };


    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <form style={{display: 'flex', flexDirection: 'column-reverse', gap: '15px'}}>
                    <Button variant="outlined" disabled={!inputValue} onClick={handleSubmit}>Confirm
                        Task</Button>
                    <Button variant="contained" component="label">
                        Upload
                        <input hidden accept="any" type="file" onChange={onFileChange}/>

                    </Button>

                    <TextField id="standard-basic" label="Task" variant="standard" value={inputValue}
                               onChange={i => setValue(i.target.value)}/>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <DatePicker
                            mask="____/__/__"
                            label={'Deadline date'}
                            value={date}
                            onChange={(newValue) => {
                                setDate(newValue)
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        >
                        </DatePicker>
                    </LocalizationProvider>
                    <TextField
                        id="outlined-multiline-static"
                        label="Task description"
                        multiline
                        rows={4}
                        defaultValue={taskDescription}
                        onChange={i => setTaskDescription(i.target.value)}
                    />
                </form>
            </Box>
        </Modal>
    );
};

export default ModalWindow;
