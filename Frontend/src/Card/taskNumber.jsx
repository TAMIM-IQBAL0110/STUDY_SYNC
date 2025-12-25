import React from 'react'

const taskNumberCard = ({ taskCount, Heading,Icon,Footer}) => {
    return (
        <div
            className="rounded-xl p-6 shadow-lg flex flex-col justify-between"
            style={{ backgroundColor: 'oklch(1 0.03 245)' }}
        >
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm font-semibold">
                        {Heading}
                    </h3>
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: 'oklch(0.4 0.1 245)', color: 'white' }}
                    >
                        <Icon size={20} />
                    </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: 'oklch(0.15 0.06 245)' }}>
                    {taskCount}
                </p>
                <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs mt-2">
                    {Footer}
                </p>
            </div>
        </div>
  )
}
export default taskNumberCard
