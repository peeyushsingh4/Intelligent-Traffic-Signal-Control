// Kept as a compatibility component for existing routes. There is intentionally no
// stock-video fallback: live tracking is always rendered from SUMO/TraCI state.
import React from 'react';
import { IndianRoadDatasetFeed } from './IndianRoadDatasetFeed';

export const LiveVideoPlayer = () => <IndianRoadDatasetFeed />;
