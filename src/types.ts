// Copied from porla/web src/api.ts: what torrents.get returns.

export type TorrentFlag =
  | "seed_mode"
  | "upload_mode"
  | "share_mode"
  | "apply_ip_filter"
  | "paused"
  | "auto_managed"
  | "duplicate_is_error"
  | "update_subscribe"
  | "super_seeding"
  | "sequential_download"
  | "stop_when_ready"
  | "need_save_resume"
  | "disable_dht"
  | "disable_lsd"
  | "disable_pex"
  | "no_verify_files"
  | "default_dont_download"
  | "i2p_torrent"
  | "disable_v1_hashes";

export type ErrC = {
  message: string;
  value: number;
};

export type InfoHashPair = [string | null, string | null];

// What Porla accepts: the pair, or a v1 (40) or v2 (64) hex string.
export type InfoHash = InfoHashPair | string;

// The resume data categories that need saving (libtorrent 2.1).
export type ResumeDataFlag =
  | "flush_disk_cache"
  | "save_info_dict"
  | "if_counters_changed"
  | "if_download_progress"
  | "if_config_changed"
  | "if_state_changed"
  | "if_metadata_changed";

export type Bitfield = [number, string];

export type Torrent = {
  $userdata: {
    category: string | null;
    completed_at: number | null; // unix time, null until complete
    metadata: Record<string, unknown>;
    tags: string[];
  } | null;

  active_duration: number;
  added_time: number;
  all_time_download: number;
  all_time_upload: number;
  announcing_to_dht: boolean;
  announcing_to_lsd: boolean;
  announcing_to_trackers: boolean;
  block_size: number;
  completed_time: number; // unix time, 0 = not complete
  connect_candidates: number;
  connections_limit: number;
  current_tracker: string;
  distributed_copies: number; // availability, -1 when not known
  down_bandwidth_queue: number;
  download_payload_rate: number;
  download_rate: number;
  errc: ErrC | null;
  finished_duration: number;
  flags: TorrentFlag[];
  has_incoming: boolean;
  has_metadata: boolean;
  info_hash: InfoHashPair;
  is_finished: boolean;
  is_seeding: boolean;
  last_download: number; // seconds ago, -1 = never
  last_seen_complete: number;
  last_upload: number; // seconds ago, -1 = never
  list_peers: number;
  list_seeds: number;
  moving_storage: boolean;
  name: string;
  need_save_resume_data: ResumeDataFlag[];
  next_announce: number; // seconds from now
  num_complete: number; // seeds in the swarm per the tracker, -1 if unknown
  num_connections: number;
  num_incomplete: number; // peers in the swarm per the tracker, -1 if unknown
  num_peers: number;
  num_pieces: number;
  num_seeds: number;
  num_uploads: number;
  progress: number;
  queue_position: number;
  ratio: number;
  ratio_real: number;
  save_path: string;
  seed_rank: number;
  seeding_duration: number;
  state: TorrentState;
  storage_mode: "allocate" | "sparse";
  total: number;
  total_done: number;
  total_download: number;
  total_failed_bytes: number;
  total_payload_download: number; // this session
  total_payload_upload: number; // this session
  total_redundant_bytes: number;
  total_upload: number;
  total_wanted: number;
  total_wanted_done: number;
  up_bandwidth_queue: number;
  upload_payload_rate: number;
  upload_rate: number;
  uploads_limit: number;
};

export type TorrentState =
  | "checking_files"
  | "downloading_metadata"
  | "downloading"
  | "finished"
  | "seeding"
  | "checking_resume_data";

export type TorrentRef = { info_hash: InfoHash; session_id: number };

// What background.ts passes to share.html with `modal.open`.
export type ShareContext = { torrent: TorrentRef };
