export type ElectoralIntegrityVotes = {
  blank: number;
  anulled: number;
  invalidated: number;
  valid: number;
  nominal: number;
  party: number;
  total: number;
};

export type ElectoralIntegrityData = {
  name: string;
  type: 'majoritarian' | 'proportional';
  voters: number;
  votes: ElectoralIntegrityVotes;
  repeatEvent: 'partial-election-repeat' | 'full-election-repeat' | 'no-action';
  pollingStations: number;
  invalidatedPollingStations: number;
  canInvalidatedVotesChangeElectionResult: boolean;
  canPartialElectionRepeatRemedyElectionResult: boolean;
  minimalVoteLossToChangeElectoralResult: null | number;
  wasMajoritarianElectedCandidateInvalidated?: undefined | boolean;
};

export interface ElectoralIntegrityClass {
  shouldRepeatElection: (electionData: ElectoralIntegrityData) => string;
}
