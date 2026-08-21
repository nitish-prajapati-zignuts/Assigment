/**
 * Centralized Service ID constants (Auto-generated)
 */
export const SERVICE_IDS = {
  MEETINGS: {
    LIST: "meetings.list",
    GET: "meetings.get",
    CREATE: "meetings.create",
    UPDATE: "meetings.update",
    DELETE: "meetings.delete",
    SUMMARIZE: "meetings.summarize",
    CHAT: "meetings.chat",
    PUBLISH: "meetings.publish",
    ARCHIVE: "meetings.archive",
    UNARCHIVE: "meetings.unarchive",
    RESTORE: "meetings.restore",
    PIN: "meetings.pin",
    CLONE: "meetings.clone",
    PERMANENT_DELETE: "meetings.permanentDelete",
    PUBLIC_SHARE_GET: "meetings.publicShareGet",
  },
  ACTION_ITEMS: {
    LIST: "actionItems.list",
    GET: "actionItems.get",
    GET_BY_MEETING: "actionItems.getByMeeting",
    LEADERBOARD: "actionItems.leaderboard",
    CREATE: "actionItems.create",
    UPDATE: "actionItems.update",
    DELETE: "actionItems.delete",
  },
  DASHBOARD: {
    STATS: "dashboard.stats",
  },
  SETTINGS: {
    GET: "settings.get",
    UPDATE: "settings.update",
    SESSIONS: "settings.sessions",
  },
  NOTIFICATIONS: {
    LIST: "notifications.list",
    READ_ALL: "notifications.readAll",
    CLEAR: "notifications.clear",
  },
  JOBS: {
    GET: "jobs.get",
  },
  AUTH: {
    REGISTER: "auth.register",
    LOGIN: "auth.login",
    LOGOUT: "auth.logout",
    ME: "auth.me",
    USERS: "auth.users",
    CHANGE_PASSWORD: "auth.changePassword",
    GENERATE_MAGIC_LINK: "auth.generateMagicLink",
    RESET_PASSWORD_WITH_TOKEN: "auth.resetPasswordWithToken",
  },
} as const;

export type SERVICE_IDS_TYPE = typeof SERVICE_IDS;

export type ServiceId =
  | (typeof SERVICE_IDS.MEETINGS)[keyof typeof SERVICE_IDS.MEETINGS]
  | (typeof SERVICE_IDS.ACTION_ITEMS)[keyof typeof SERVICE_IDS.ACTION_ITEMS]
  | (typeof SERVICE_IDS.DASHBOARD)[keyof typeof SERVICE_IDS.DASHBOARD]
  | (typeof SERVICE_IDS.SETTINGS)[keyof typeof SERVICE_IDS.SETTINGS]
  | (typeof SERVICE_IDS.NOTIFICATIONS)[keyof typeof SERVICE_IDS.NOTIFICATIONS]
  | (typeof SERVICE_IDS.JOBS)[keyof typeof SERVICE_IDS.JOBS]
  | (typeof SERVICE_IDS.AUTH)[keyof typeof SERVICE_IDS.AUTH];
