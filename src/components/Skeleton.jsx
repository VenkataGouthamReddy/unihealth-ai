import React from 'react';

/**
 * Reusable shimmer skeleton components.
 * Usage:
 *   <SkeletonCard />                 — card placeholder
 *   <SkeletonListItem />             — list row placeholder
 *   <SkeletonText lines={3} />       — text block placeholder
 *   <SkeletonAvatar size={48} />     — avatar circle placeholder
 *   <SkeletonDoctorCard />           — doctor card placeholder
 *   <SkeletonAppointmentCard />      — appointment card placeholder
 */

function Bone({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonAvatar({ size = 48, className = '' }) {
  return (
    <div
      className={`skeleton flex-shrink-0 ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
}

export function SkeletonText({ lines = 2, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Bone
          key={i}
          className="h-3 rounded-full"
          style={{ width: i === lines - 1 ? '65%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonListItem({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl card-mobile ${className}`}>
      <SkeletonAvatar size={44} />
      <div className="flex-1 space-y-2">
        <Bone className="h-3.5 rounded-full" style={{ width: '55%' }} />
        <Bone className="h-2.5 rounded-full" style={{ width: '80%' }} />
      </div>
      <Bone className="h-7 rounded-xl" style={{ width: 64 }} />
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card-mobile p-5 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <SkeletonAvatar size={40} />
        <div className="flex-1 space-y-2">
          <Bone className="h-3.5 rounded-full" style={{ width: '50%' }} />
          <Bone className="h-2.5 rounded-full" style={{ width: '70%' }} />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="mt-4 flex gap-3">
        <Bone className="h-10 flex-1 rounded-xl" />
        <Bone className="h-10 w-10 rounded-xl flex-shrink-0" />
      </div>
    </div>
  );
}

export function SkeletonDoctorCard({ className = '' }) {
  return (
    <div className={`card-mobile p-5 ${className}`}>
      <div className="flex justify-between mb-4">
        <SkeletonAvatar size={56} className="rounded-2xl" style={{ borderRadius: 16 }} />
        <Bone className="h-6 rounded-xl" style={{ width: 72 }} />
      </div>
      <Bone className="h-4 rounded-full mb-2" style={{ width: '60%' }} />
      <Bone className="h-3 rounded-full mb-4" style={{ width: '40%' }} />
      <SkeletonText lines={2} />
      <div className="mt-4 flex gap-3">
        <Bone className="h-11 flex-1 rounded-xl" />
        <Bone className="h-11 w-11 rounded-xl flex-shrink-0" />
      </div>
    </div>
  );
}

export function SkeletonAppointmentCard({ className = '' }) {
  return (
    <div className={`card-mobile p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size={44} className="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Bone className="h-3.5 rounded-full" style={{ width: '45%' }} />
          <Bone className="h-2.5 rounded-full" style={{ width: '65%' }} />
        </div>
        <Bone className="h-6 rounded-full" style={{ width: 80 }} />
      </div>
      <div className="flex gap-3 pt-3 border-t border-white/5">
        <Bone className="h-9 flex-1 rounded-xl" />
        <Bone className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonNotificationCard({ className = '' }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl card-mobile ${className}`}>
      <SkeletonAvatar size={40} className="rounded-xl" />
      <div className="flex-1 space-y-2">
        <Bone className="h-3.5 rounded-full" style={{ width: '55%' }} />
        <Bone className="h-2.5 rounded-full" style={{ width: '85%' }} />
        <Bone className="h-2 rounded-full" style={{ width: '35%' }} />
      </div>
    </div>
  );
}

export function SkeletonReminderCard({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl card-mobile ${className}`}>
      <SkeletonAvatar size={44} className="rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Bone className="h-3.5 rounded-full" style={{ width: '50%' }} />
        <Bone className="h-2.5 rounded-full" style={{ width: '70%' }} />
      </div>
      <Bone className="h-6 w-10 rounded-full flex-shrink-0" />
    </div>
  );
}

export function SkeletonStatCard({ className = '' }) {
  return (
    <div className={`card-mobile p-5 ${className}`}>
      <Bone className="h-3 rounded-full mb-4" style={{ width: '55%' }} />
      <Bone className="h-8 rounded-lg mb-2" style={{ width: '40%' }} />
      <Bone className="h-2.5 rounded-full" style={{ width: '70%' }} />
    </div>
  );
}
