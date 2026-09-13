import Ajv2020 from 'ajv/dist/2020';
import asset from '../../../schemas/asset.schema.json';
import connection from '../../../schemas/connection.schema.json';
import telemetry from '../../../schemas/telemetry.schema.json';
import processPath from '../../../schemas/process_path.schema.json';
import scenario from '../../../schemas/scenario.schema.json';

import binding from '../../../schemas/model_binding.schema.json';
import facility from '../../../schemas/facility.schema.json';
import area from '../../../schemas/area.schema.json';
import unit from '../../../schemas/unit.schema.json';
import documentSchema from '../../../schemas/document.schema.json';
export interface Asset {
  asset_id: string; tag: string; name: string; type: string;
  facility_id: string; area_id: string; unit_id: string; model_ref: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  dimensions: { height: number; length: number; width: number; diameter: number };
  status: string; service: string; interactive: boolean; synthetic: boolean;
}
export interface ProcessPath { process_path_id: string; name: string; ordered_asset_ids: string[]; connection_ids: string[] }
export interface ScenarioAction { type: string; asset_id?: string; metric?: string; value?: string | number | boolean; path_id?: string; layer_id?: string; message?: string; style?: string }
export interface Scenario { scenario_id: string; name: string; trigger_asset_id?: string; steps: { at_seconds: number; actions: ScenarioAction[] }[] }
export interface NormalizedData {
  assets: Asset[];
  connections: { connection_id: string; from_asset_id: string; to_asset_id: string; service: string; route_points?: { x: number; y: number; z: number }[]; diameter?: number }[];
  telemetry: { point_id: string; asset_id: string; parameter: string; value: number | string | boolean; unit: string; status: string }[];
  process_paths: ProcessPath[];
  scenarios: Scenario[];
  model_bindings: { asset_id: string; model_ref: string; node_name: string }[];
  facilities: { facility_id: string; name: string }[];
  areas: { area_id: string; name: string }[];
  units: { unit_id: string; name: string }[];
  documents: { document_id: string; asset_id: string; title: string; source_ref: string }[];
}
export interface NormalizedDataLoader {
  load(signal?: AbortSignal): Promise<NormalizedData>;
}
const ajv = new Ajv2020({ allowUnionTypes: true });
const schemas = { assets: asset, connections: connection, telemetry, process_paths: processPath, scenarios: scenario, model_bindings: binding, facilities: facility, areas: area, units: unit, documents: documentSchema };
const validators = Object.entries(schemas).map(([key, schema]) => ({
  key: key as keyof NormalizedData,
  validate: ajv.compile({ type: 'array', items: schema }),
}));
/** Base URL must serve canonical normalized output, never ingestion sources. */
export class JsonNormalizedDataLoader implements NormalizedDataLoader {
  constructor(private readonly baseUrl = './', private readonly fetcher: typeof fetch = (...args) => globalThis.fetch(...args)) {}
  async load(signal?: AbortSignal): Promise<NormalizedData> {
    const entries = await Promise.all(validators.map(async ({ key, validate }) => {
      const response = await this.fetcher(`${this.baseUrl.replace(/\/?$/, '/')}${key}.json`, { signal });
      if (!response.ok) throw new Error(`${key}: HTTP ${response.status}`);
      const value: unknown = await response.json();
      if (!validate(value)) throw new Error(`${key}: ${ajv.errorsText(validate.errors)}`);
      return [key, value];
    }));
    return Object.fromEntries(entries) as unknown as NormalizedData;
  }
}
