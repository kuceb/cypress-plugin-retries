workflow "Release npm" {
  on = "release"
  resolves = ["GitHub Action for npm"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  secrets = ["NPM_TOKEN"]
  runs = "npm publish"
}
