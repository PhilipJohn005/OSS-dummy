'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import TaskCard from '@/components/help-request-comp/TaskCard';

type Task = {
  id?: number;
  card_name: string;
  tags: string[];
  user_email: string;
  product_description?: string;
  issues: {
    id: number;
    title: string;
    description: string;
    link: string;
    images: string[];
  }[];
};

interface ToggleTagFn {
  (tag: string): void;
}

interface AddCardRequest {
  repo_url: string;
  product_description: string;
  tags: string[];
}

interface AddCardResponse {
  message: string;
  [key: string]: any;
}

interface CustomSession {
  accessToken?: string;
  [key: string]: any;
}

const Add = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shouldRunButtonEffect, setShouldRunButtonEffect] = useState(false);

  const { data: session } = useSession() as { data: CustomSession | null };

  useEffect(() => {
    if (!session?.user?.jwt) return;
    const fetchCards = async () => {
      try {
        const res = await fetch("http://localhost:4000/server/fetch-user-cards", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session?.user as any)?.jwt ?? ''}`,
          },
        });
        const result = await res.json();
        setTasks(result.data || []);
      } catch (e) {
        console.error("Error fetching cards", e);
      }
    }
    fetchCards();
  }, [session?.user?.jwt, shouldRunButtonEffect]);

  const availableTags = ['AWS', 'GCP', 'Azure', 'React', 'Node.js', 'Python', 'Docker', 'Kubernetes'];

  const toggleTag: ToggleTagFn = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body: AddCardRequest = {
      repo_url: repoUrl,
      product_description: productDescription,
      tags: selectedTags
    };

    const res = await fetch("http://localhost:4000/server/add-card", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any)?.jwt ?? ''}`,
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error: AddCardResponse = await res.json();
      console.error("Error:", error.message);
      return;
    }

    setShouldRunButtonEffect(prev => !prev);
    setRepoUrl('');
    setProductDescription('');
    setSelectedTags([]);
    console.log("Added successfully");
  };

  return (
    <div className='h-screen w-screen px-4 py-4'>
      <form onSubmit={handleSubmit} className='border border-black p-6'>

        <div className='my-4'>
          <label className='px-4 block mb-2 font-medium'>Repo Link</label>
          <input
            type='url'
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className='border-2 border-gray-300 rounded px-3 py-2 w-full'
            required
          />
        </div>

        <div className='my-4'>
          <label className='px-4 block mb-2 font-medium'>Product Description</label>
          <textarea
            className='border-2 border-gray-300 rounded px-3 py-2 w-full'
            rows={3}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
          />
        </div>

        <div className='my-4'>
          <label className='px-4 block mb-2 font-medium'>Tags</label>
          <div className='flex flex-wrap gap-2'>
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`px-3 py-1 rounded-full border ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className='mt-2 text-sm text-gray-600'>
            Selected: {selectedTags.join(', ') || 'None'}
          </div>
        </div>

        <div className='flex justify-center mt-6'>
          <button
            type="submit"
            className='px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
          >
            Add To Table
          </button>
        </div>
      </form>

      <div>
        <h1>Your Help Requests</h1>
        <div className="mt-4 mb-10">
          {tasks.length > 0 ? (
            <div className="flex overflow-x-auto pb-2 gap-4">
              {tasks.map((task, index) => (
                <TaskCard key={index} task={task} />
              ))}
            </div>
          ) : (
            <div>No help requests yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Add;
