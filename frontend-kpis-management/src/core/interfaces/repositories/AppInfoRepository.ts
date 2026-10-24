export interface AppInfoRepository {
  /** Versión del backend (app.version de application.properties). */
  getVersion(): Promise<string>;
}
