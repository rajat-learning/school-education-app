'use client';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Box, Paper } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';

// Required styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface MuiPdfViewerProps {
  fileUrl: string;
  title?: string;
}

export default function MuiPdfViewer({ fileUrl, title }: MuiPdfViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PictureAsPdf color="error" />
          <strong>{title}</strong>
        </Box>
      )}
      <Box
        sx={{
          height: '70vh',
          width: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'auto',
        }}
      >
        <Worker workerUrl="/pdf.worker.min.js">
          <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>
      </Box>
    </Paper>
  );
}