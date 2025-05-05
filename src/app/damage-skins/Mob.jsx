import Image from "next/image"
import { useState } from "react";

export default function Mob() {
    const [critRate, setCritRate] = useState(0);
    const [minDamage, setMinDamage] = useState(0);
    const [maxDamage, setMaxDamage] = useState(0);
    const [lines, setLines] = useState(0);


    function handleClick() {
        console.log(simulateDamage(1, 100));
    }

    const simulateDamage = (min, max) => {
        const randomDamage = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomDamage;
    }


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <Image
                src="/images/mobs/1.png"
                width={100}
                height={100}
                className="rounded-lg shadow-lg"
            />
            <button onClick={handleClick} className="text-xl font-bold">hello this is a mob</button>
        </div>
    )
}
