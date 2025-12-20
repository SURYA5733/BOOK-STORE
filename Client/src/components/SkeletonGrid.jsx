// src/components/SkeletonGrid.jsx
import React from 'react'

export default function SkeletonGrid({count=6}) {
  const items = Array.from({length: count})
  return (
    <div className="row g-3">
      {items.map((_,i)=>(
        <div key={i} className="col-sm-6 col-md-4">
          <div className="card h-100">
            <div className="bg-light" style={{height:200, animation: 'pulse 1.2s infinite'}}> </div>
            <div className="card-body">
              <div className="placeholder-glow">
                <span className="placeholder col-7"></span>
                <p className="placeholder col-4"></p>
                <p className="placeholder col-12"></p>
              </div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1 }
          50% { opacity: 0.5 }
          100% { opacity: 1 }
        }
        .placeholder { display: inline-block; background: #e9ecef; height: 16px; border-radius: 4px; }
        .placeholder.col-12 { width:100%; height:12px; margin-top:8px; }
        .placeholder.col-7 { width:70%; height:20px; display:block; margin-bottom:8px; }
        .placeholder.col-4 { width:40%; height:12px; display:block; margin-bottom:8px; }
      `}</style>
    </div>
  )
}
