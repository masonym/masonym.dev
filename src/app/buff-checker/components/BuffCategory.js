import React from 'react';
import Image from 'next/image';

const BuffCategory = ({ category, categoryId, detectedBuffs }) => {
    const isDetected = (buffId, group = null) => {
        if (!detectedBuffs) return false;
        
        if (categoryId === 'nonstackingConsumables') {
            return group && detectedBuffs.nonstackingConsumables[group].includes(buffId);
        }
        
        return detectedBuffs[categoryId]?.includes(buffId);
    };

    const renderBuff = (buff, group = null) => {
        const detected = isDetected(buff.id, group);
        const imagePath = `/images/buffs/${categoryId === 'nonstackingConsumables' ? 'nonstack' : categoryId}-${buff.id}.png`;
        
        return (
            <div key={buff.id} className={`flex items-center space-x-2 p-2 rounded ${detected ? 'bg-green-100' : ''}`}>
                <div className="relative w-8 h-8">
                    <Image
                        src={imagePath}
                        alt={buff.name}
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </div>
                <span className={detected ? 'text-green-700 font-medium' : ''}>{buff.name}</span>
            </div>
        );
    };

    if (categoryId === 'nonstackingConsumables') {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">{category.group1.name}</h4>
                        <div className="space-y-2">
                            {category.group1.buffs.map(buff => renderBuff(buff, 'group1'))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">{category.group2.name}</h4>
                        <div className="space-y-2">
                            {category.group2.buffs.map(buff => renderBuff(buff, 'group2'))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
            <div className="space-y-2">
                {category.buffs.map(buff => renderBuff(buff))}
            </div>
        </div>
    );
};

export default BuffCategory;
