'use client';
import { Layout, DynamicCard } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import {
  fetchProfileData,
  fetchLocationDetails,
} from '../../services/ProfileService';
import { useEffect, useState } from 'react';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
export default function Home() {
  const cardData = [
    { title: 'Programs', icon: '📄' },
    { title: 'Projects', icon: '📐' },
    { title: 'Courses', icon: '🎓' },
    { title: 'Reports', icon: '📊' },
  ];

  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const token = localStorage.getItem('accToken') || '';
        const userId = localStorage.getItem('userId') || '';

        const data = await fetchProfileData(userId, token);
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  const handleAccountClick = () => {
    console.log('Account clicked');
    router.push('http://localhost:3000');
    localStorage.removeItem('accToken');
  };

 
  console.log(profileData);
  return (

    <Layout
      showTopAppBar={{
        title: 'Home',
        showMenuIcon: false,
        actionIcons: [
          {
            icon: <LogoutIcon />,
            ariaLabel: 'Account',
            onClick: handleAccountClick,
          },
        ],
      }}
      isFooter={true}
      showLogo={true}
      showBack={true}
    >
      <div
        style={{
          padding: '20px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2>Welcome, {profileData?.firstName}</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Browse Shikshagraha library to find relevant content based on your preferences (Board, Medium, Class,Subject)
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {cardData.map((card, index) => (
            <DynamicCard
              key={index}
              title={card.title}
              icon={card.icon} // Assuming DynamicCard supports icons
            />
          ))}
        </div>


      </div>
    </Layout>
  );
}
