'use client';
import React, { useRef, useEffect ,useState} from 'react';
import { useRouter } from 'next/navigation';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Result } from '@zxing/library';
import { Layout } from '@shared-lib';
import { Box, Snackbar, Alert, AlertColor } from '@mui/material';

const Scanner = () => {
  const [stopScanning, setStopScanning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      stopScan();
    };
  }, []);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const startScan = async () => {
    setStopScanning(false);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 1024, ideal: 1280, max: 1920 },
          height: { min: 576, ideal: 720, max: 1080 },
          frameRate: { ideal: 10, max: 15 },
          facingMode: { exact: 'environment' },
        }
      });
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();
      }
      const result: any = await codeReaderRef.current?.decodeOnceFromVideoElement(video!);
      if (!stopScanning && result) {
        handleScanResult(result);
      }
    } catch (err) {
      showSnackbar('Something went wrong', 'error');
    }
  };

  const handleScanResult = async (result: Result) => {
    const path: any = result.getText();
    await stopScan();
    if(path.includes('verifyCertificate')){
      let userId=path.split('/').pop();
      console.log("id",userId)
      let baseUrl=localStorage.getItem('origin')
      window.location.href = `${baseUrl}/certificate-verify/${userId}`
      return;
    }
    console.log("path",path)
    window.location.href=path
    return;
  };

  const showSnackbar = (text: string, type: AlertColor) => {
    setSnackbarMessage(text);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };


  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (permission.state === 'denied') {
        showSnackbar('Camera permission is required to scan QR code. Please enable it in your browser or app settings.', 'error');
        return;
      }
      if (permission.state === 'granted' || permission.state === 'prompt') {
        await startScan();
      }
    } catch (err) {
      showSnackbar('Error checking camera permissions', 'error');
    }
  };

  const stopScan = () => {
    setStopScanning(true);
    setIsScanning(false);
    const video = videoRef.current;
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    codeReaderRef.current = null;
  };

  return (
    <>
      <Layout
        showTopAppBar={{
          title: 'Scan QR Code',
          showMenuIcon: true,
          showBackIcon: true,
          backIconClick: handleBack,
        }}
        isFooter={false}
        showLogo={false}
        showBack={true}
      >
        <Box
          sx={{
            height: 'calc(100vh - 48px)',
            width: '100%',
            overflow: 'hidden',
            position: 'fixed',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <video
            ref={videoRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              maxWidth: '320px',
              height: '250px',
              transform: 'translate(-50%, -50%)',
              border: '3px solid rgba(0, 255, 0, 0.6)',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.4)',
              zIndex: 2,
            }}
          />
        </Box>
      </Layout>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={()=>setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={()=>setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Scanner;
