"use client";
import Mob from './Mob.jsx'
import { useState } from "react"

export default function DamageSkins(props) {
    const [selectedDamageSkin, setSelectedDamageSkin] = useState([]);



    return (
        <div>
            <Mob />
        </div>
    )
}
