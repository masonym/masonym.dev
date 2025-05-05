import Image from "next/image";

export default function Mob({ onClick }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <button onClick={onClick} className="text-xl font-bold focus:outline-none">
                <Image
                    src="/images/snail.png"
                    width={100}
                    height={100}
                    className="rounded-lg shadow-lg"
                    draggable="false"
                />
            </button>
        </div>
    );
}
