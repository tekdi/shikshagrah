'use client';
import { Layout } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';

export default function Content() {
    const iframeSrc = 'http://localhost:3002';

  const router = useRouter();
  const handleAccountClick = () => {
    console.log('Account clicked');
    router.push('http://localhost:3000');
    localStorage.removeItem('accToken');
  };
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
          showBack={true}    >
             <iframe
        src={iframeSrc}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
        }}
        title="Angular App"
      ></iframe>
    
    </Layout>
  );
}
