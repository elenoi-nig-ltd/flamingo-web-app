// components/DebugHelper.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import { getAuthHeaders } from '@/utils/auth';

const DebugHelper = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isDebugging, setIsDebugging] = useState(false);

  const runDiagnostics = async () => {
    setIsDebugging(true);
    const info: any = {};

    try {
      // 1. Check BASEURL configuration
      info.baseUrl = BASEURL;
      info.fullEndpoint = `${BASEURL}/home-item-categories`;

      // 2. Check authentication headers
      const headers = getAuthHeaders();
      info.authHeaders = headers;
      info.hasAuthToken = !!headers.Authorization;

      // 3. Test GET endpoint (public)
      try {
        const getResponse = await axios.get(`${BASEURL}/home-item-categories`);
        info.getEndpoint = {
          status: 'SUCCESS',
          statusCode: getResponse.status,
          data: getResponse.data,
          headers: getResponse.headers
        };
      } catch (err: any) {
        info.getEndpoint = {
          status: 'FAILED',
          error: err.response?.data || err.message,
          statusCode: err.response?.status
        };
      }

      // 4. Test POST endpoint (requires auth)
      try {
        const testCategory = {
          name: 'Debug Test Category',
          description: 'This is a test category for debugging'
        };

        const postResponse = await axios.post(
          `${BASEURL}/home-item-categories`,
          testCategory,
          { headers }
        );

        info.postEndpoint = {
          status: 'SUCCESS',
          statusCode: postResponse.status,
          data: postResponse.data
        };

        // Clean up the test category
        try {
          await axios.delete(
            `${BASEURL}/home-item-categories/${postResponse.data._id}`,
            { headers }
          );
          info.cleanupStatus = 'SUCCESS';
        } catch (deleteErr) {
          info.cleanupStatus = 'FAILED';
        }

      } catch (err: any) {
        info.postEndpoint = {
          status: 'FAILED',
          error: err.response?.data || err.message,
          statusCode: err.response?.status,
          requestHeaders: headers,
          requestData: {
            name: 'Debug Test Category',
            description: 'This is a test category for debugging'
          }
        };
      }

      // 5. Environment checks
      info.environment = {
        nodeEnv: process.env.NODE_ENV,
        hasCloudinaryConfig: !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET),
        userAgent: navigator.userAgent,
        currentUrl: window.location.href
      };

    } catch (generalErr: any) {
      info.generalError = generalErr.message;
    }

    setDebugInfo(info);
    setIsDebugging(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Helper</h3>
      <button
        onClick={runDiagnostics}
        disabled={isDebugging}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400"
      >
        {isDebugging ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Diagnostic Results:</h4>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96 text-gray-800">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugHelper;