const { investigateSidedVotes } = require("./sided-vote");
const { investigateNullBoxes } = require("./null-boxes");
const { investigateRemovedVotes } = require("./removed-votes");
const { investigateBoxVoting } = require("./box-voting");
const { investigateIndeferidos } = require("./indeferidos");
const { investigateMissingVotes } = require("./missing-votes");
const { investigateSizeDeviation } = require("./size-deviation");
const { investigateAbsentBoxes } = require("./absent-boxes");
const { investigateMissingBoxes } = require("./missing-boxes");
const { investigateColigVotes } = require("./colig-votes");
const { investigateMissingPositions } = require("./missing-positions");
const { investigateTransitionBoxes } = require("./transition-boxes");
const { investigateVoteDeviation } = require("./vote-deviation");
const { populateCityInfo } = require("./city-info");

module.exports = (investigationData) => {
  investigateSidedVotes(investigationData);
  investigateMissingVotes(investigationData);
  investigateMissingPositions(investigationData);
  investigateTransitionBoxes(investigationData);
  investigateNullBoxes(investigationData);
  investigateSizeDeviation(investigationData);
  investigateVoteDeviation(investigationData);
  investigateAbsentBoxes(investigationData);
  investigateMissingBoxes(investigationData);
  investigateColigVotes(investigationData);
  investigateRemovedVotes(investigationData);
  populateCityInfo(investigationData);
  investigateBoxVoting(investigationData);
};