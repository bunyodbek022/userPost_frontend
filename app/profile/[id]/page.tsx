"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function UserProfileView() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/users/${id}`).then(res => setData(res.data.data || res.data));
  }, [id]);

  if (!data) return <div className="p-20 text-center font-black">USER NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-white p-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-7xl font-black mb-8 italic tracking-tighter">{data.userName}</h1>
        <div className="grid grid-cols-2 gap-10 py-10 border-y border-gray-100">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</p>
              <p className="text-xl font-bold">{data.email}</p>
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">User Status</p>
              <p className="text-xl font-bold capitalize">{data.role}</p>
           </div>
        </div>
        <div className="mt-10">
           <h3 className="text-xs font-black uppercase text-gray-400 mb-6">Activity</h3>
           <p className="italic text-gray-400">User's posts and statistics would appear here...</p>
        </div>
      </div>
    </div>
  );
}