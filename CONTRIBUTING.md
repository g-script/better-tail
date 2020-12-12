# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to `better-tail`. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of contents

- [Code of Conduct][code-of-conduct]
- [I just have a question][question]
- [How can I contribute?][how-can-i-contribute]
  - [Reporting bugs][reporting-bugs]
  - [Suggesting enhancements][suggesting-enhancements]
  - [Your first code contribution][your-first-code-contribution]
  - [Pull Requests][pull-requests]
- [Styleguides][styleguides]
  - [Git commit message][git-commit-message]
  - [JavaScript styleguide][js-styleguide]

## Code of conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

### Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the
  overall community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or
  advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email
  address, without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Community leaders have the right and responsibility to remove, edit, or reject
comments, commits, code, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

### Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
[goudry.nicolas@gmail.com][contact].
All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the
reporter of any incident.

### Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

#### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from community leaders, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

#### 2. Warning

**Community Impact**: A violation through a single incident or series
of actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified period of time. This
includes avoiding interactions in community spaces as well as external channels
like social media. Violating these terms may lead to a temporary or
permanent ban.

#### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including
sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public
communication with the community for a specified period of time. No public or
private interaction with the people involved, including unsolicited interaction
with those enforcing the Code of Conduct, is allowed during this period.
Violating these terms may lead to a permanent ban.

#### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community
standards, including sustained inappropriate behavior,  harassment of an
individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within
the community.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][contributor-covenant-homepage],
version 2.0, available at
[https://www.contributor-covenant.org/version/2/0/code_of_conduct.html][contributor-covenant-v2.0].

Community Impact Guidelines were inspired by 
[Mozilla's code of conduct enforcement ladder][mozilla-coc].

For answers to common questions about this code of conduct, see the FAQ at
[https://www.contributor-covenant.org/faq][contributor-covenant-faq].


## I just have a question

If the Readme file wasn't enough to answer your question, feel free to open a new [discussion][newdiscussion].

**But, please, don't file an issue to ask a question!!!**

## How can I contribute?

### Reporting bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report :pencil:, reproduce the behavior :computer: :computer:, and find related reports :mag_right:.

Before creating bug reports, please check this list as you might find out that you don't need to create one:

* **Check the [debugging section of the Readme file][readme-debug]**. You might be able to find the cause of the problem and fix things yourself. Most importantly, check if you're using the latest version of `better-tail`.
* **Search for an already existing bug report in [issues][issues]**. If it already exists **and the issue is still open**, add a comment to the existing issue instead of opening a new one.

When you are creating a bug report, please include as many details as possible. Fill in [the template][bug-report-template], the information it asks for helps us resolve issues faster.

> **Note:** If you find a **Closed** issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

### Suggesting enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion :pencil: and find related suggestions :mag_right:.

Before creating enhancement suggestions, please check this list as you might find out that you don't need to create one:

* **Check the [Readme file][readme]**. You might discover that the enhancement is already available. Most importantly, check if you're using the latest version of `better-tail`.
* **Search for an already existing feature request in [issues][issues]**. If it already exists **and the issue is still open**, add a comment to the existing issue instead of opening a new one.

When you are creating an enhancement suggestion, please include as many details as possible. Fill in [the template][feature-request-template], including the steps that you imagine you would take if the feature you're requesting existed.

### Your first code contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

* [Beginner issues][beginner] - issues which should only require a few lines of code, and a test or two.
* [Help wanted issues][help-wanted] - issues which should be a bit more involved than `beginner` issues.

Both issue lists are sorted by total number of comments. While not perfect, number of comments is a reasonable proxy for impact a given change will have.

### Pull Requests

Please follow these steps to have your contribution considered by the maintainers:

1. Follow the [styleguides][styleguides]
2. [Run tests locally][readme-tests]
3. After you submit your pull request, verify that all [status checks][status-checks] are passing <details><summary>What if the status checks are failing?</summary>If a status check is failing, and you believe that the failure is unrelated to your change, please leave a comment on the pull request explaining why you believe the failure is unrelated. A maintainer will re-run the status check for you. If we conclude that the failure was a false positive, we will take needed actions to solve the problem.</details>

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### Git commit messages

- Use the present tense ("add this" not "added this")
- Use the imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters or less
- Start the commit message with the type of change you're committing:
  - `(feat):` a new feature
  - `(fix):` a bug fix
  - `(docs):` documentation only changes
  - `(style):` changes that do not affect the meaning of the code (white-space, formatting, etc)
  - `(refactor):` a code change that neither fixes a bug or adds a feature
  - `(test):` adding or updating tests
  - `(chore):` core updates (config files, npm scripts, dev dependencies, etc)
  - `(ci):` adding or updating CI config files

Examples:
- `(feat): add support for...`
- `(fix): invalid usage of...`
- etc…

### JavaScript styleguide

All JavaScript code is linted with [Standard][standard].

* Make sure your code is compatible with at least Node.js 8
* Place requires in the following order:
    * Built in Node Modules (such as `path`)
    * Local Modules (using relative paths)
* Place class properties in the following order:
    * Class methods and properties (methods starting with `static`)
    * Instance methods and properties
* Avoid platform-dependent code

[code-of-conduct]: #code-of-conduct
[question]: #i-just-have-a-question
[how-can-i-contribute]: #how-can-i-contribute
[reporting-bugs]: #reporting-bugs
[suggesting-enhancements]: #suggesting-enhancements
[your-first-code-contribution]: #your-first-code-contribution
[pull-requests]: #pull-requests
[styleguides]: #styleguides
[git-commit-message]: #git-commit-message
[js-styleguide]: #javascript-styleguide
[contact]: mailto:goudry.nicolas@gmail.com
[contributor-covenant-homepage]: https://www.contributor-covenant.org
[contributor-covenant-v2.0]: https://www.contributor-covenant.org/version/2/0/code_of_conduct.html
[mozilla-coc]: https://github.com/mozilla/diversity
[contributor-covenant-faq]: https://www.contributor-covenant.org/faq
[newdiscussion]: https://github.com/g-script/better-tail/discussions/new
[readme]: https://github.com/g-script/better-tail/blob/master/README.md
[readme-debug]: https://github.com/g-script/better-tail/blob/master/README.md#beetle-debugging
[readme-tests]: https://github.com/g-script/better-tail/blob/master/README.md#game_die-running-tests
[issues]: https://github.com/g-script/better-tail/issues?q=is%3Aissue+is%3Aopen
[bug-report-template]: https://github.com/g-script/better-tail/blob/master/.github/ISSUE_TEMPLATE/bug_report.md
[feature-request-template]: https://github.com/g-script/better-tail/blob/master/.github/ISSUE_TEMPLATE/feature_request.md
[beginner]: https://github.com/g-script/better-tail/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+sort%3Acomments-desc
[help-wanted]: https://github.com/g-script/better-tail/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22+sort%3Acomments-desc
[status-checks]: https://help.github.com/articles/about-status-checks
[standard]: https://standardjs.com
