import React, { useState } from 'react';
import { Storage, Auth } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { createProfile } from '../graphql/mutations';
import toast from 'react-hot-toast';
import Button from './Button';

const client = generateClient();

export default function ListingForm() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const validTypes = ['image/jpeg', 'image/png'];
    if (!file || !validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG or PNG image.', {
        style: { background: '#D5534F', color: '#fff' },
      });
      return;
    }
    try {
      setIsLoading(true);
      const { key } = await Storage.put(`profiles/${file.name}`, file, {
        contentType: file.type,
      });
      setImages([...images, key]);
      toast.success('Image uploaded successfully!', {
        style: { background: '#4A7043', color: '#fff' },
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image.', {
        style: { background: '#D5534F', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const user = await Auth.currentAuthenticatedUser();
      await client.graphql({
        query: createProfile,
        variables: {
          input: {
            name,
            location,
            price,
            description,
            imageUrl: images[0], // Use first image as primary
            owner: user.attributes.sub, // Use Cognito sub
          },
        },
      });
      toast.success('Profile created successfully!', {
        style: { background: '#4A7043', color: '#fff' },
      });
      setName('');
      setLocation('');
      setPrice('');
      setDescription('');
      setImages([]);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile.', {
        style: { background: '#D5534F', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-dark-gray">Create Profile</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded mt-2"
        placeholder="Name"
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 border rounded mt-2"
        placeholder="Location"
      />
      <input
        type="text"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border rounded mt-2"
        placeholder="Price (e.g., Free or $50)"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mt-2"
        placeholder="About Me"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full p-2 mt-2"
      />
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Create Profile'}
      </Button>
    </div>
  );
}