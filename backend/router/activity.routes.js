import express from 'express';
import { createActivity, getActivitiesForUser,markActivitiesAsRead } from '../controller/activity.controller.js';

const activityRouter=express.Router();


activityRouter.get('/user/:userId/workspace/:workspaceId', getActivitiesForUser);
activityRouter.patch('/user/:userId/workspace/:workspaceId/mark-read', markActivitiesAsRead);
activityRouter.post('/create-activity',createActivity);

export default activityRouter;