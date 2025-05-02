/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title'); // Get card title from query

  const iframeSources = {
    Programs: `${process.env.NEXT_PUBLIC_PROGRAM_BASE_URL}/mfe_pwa/listing/program?type=program`,
    Projects: `${process.env.NEXT_PUBLIC_PROGRAM_BASE_URL}/mfe_pwa/listing/project?type=project`,
    Survey: `${process.env.NEXT_PUBLIC_PROGRAM_BASE_URL}/mfe_pwa/listing/survey?type=survey`,
    Reports: `${process.env.NEXT_PUBLIC_PROGRAM_BASE_URL}/mfe_pwa/report/list?type=report`,
    Observation: `${process.env.NEXT_PUBLIC_PROGRAM_BASE_URL}/mfe_pwa/observation?type=listing`,
  };
  const iframeSrc = iframeSources[title] || '';
  return { iframeSrc, title };
}

export default function Content() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleAccountClick = () => setShowLogoutModal(true);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('accToken');
    localStorage.clear();
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
  };

  const handleLogoutCancel = () => setShowLogoutModal(false);
  const backIconClick = () => {
    router.back();
  };

  if(isAuthenticated) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsWrapper
          // handleAccountClick={handleAccountClick}
          showLogoutModal={showLogoutModal}
          handleLogoutCancel={handleLogoutCancel}
          handleLogoutConfirm={handleLogoutConfirm}
          backIconClick={backIconClick}
        />
      </Suspense>
    );
  }
  else {
    handleLogoutConfirm();
  }

}

function SearchParamsWrapper({
  showLogoutModal,
  handleLogoutCancel,
  handleLogoutConfirm,
  backIconClick,
}) {
  const { iframeSrc, title } = SearchParamsHandler();

  useEffect(() => {
    if (iframeSrc) {
      window.location.href = iframeSrc; // Redirect in same tab
    }
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, [iframeSrc]);

  return (
    <>
      <Layout
        showTopAppBar={{
          title: title || 'Content',
          showMenuIcon: true,
          showBackIcon: true,
          backIconClick: backIconClick,
          // profileIcon: [
          //   {
          //     icon: <LogoutIcon />,
          //     ariaLabel: 'Account',
          //     onLogoutClick: handleAccountClick,
          //   },
          // ],
        }}
        isFooter={false}
        showLogo={true}
      >
        {/* <iframe
          src={iframeSrc}
          style={{
            width: '100%',
            height: '100vh',
            border: 'none',
          }}
          title={title}
        ></iframe> */}
      </Layout>

      {/* <Dialog open={showLogoutModal} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            No
          </Button>
          <Button onClick={handleLogoutConfirm} color="secondary">
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
}
