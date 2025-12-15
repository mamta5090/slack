export const isNotificationPaused = (user) => {
  if (!user || !user.notificationPausedUntil) return false;

  const pausedUntil = new Date(user.notificationPausedUntil);
  const now = new Date();


  return now < pausedUntil;
};