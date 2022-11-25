import React, {useEffect, useState} from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import ClearIcon from '@mui/icons-material/Clear';
import db from "../firebase";
import {Tooltip} from "@mui/material";

/**
 * Модуль для отображения статуса задачи
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function StandaloneToggleButton(props) {
    const [selected, setSelected] = useState(null);
  useEffect(() => {
      setSelected(!props.value)
  })
    function update () {
        db.collection('todos').doc(props.id).set({todo: {isDone: !props.value}},{merge:true})
    }
    return (
        <ToggleButton
            value="check"
            selected={selected}
            onChange={() => {
                setSelected(!selected);
                update();
            }}>
            {selected? <Tooltip children={<CheckIcon />} title={'Done'}/> : <Tooltip children={<ClearIcon/>} title={'Not yet'}/>}
        </ToggleButton>
    );
}
