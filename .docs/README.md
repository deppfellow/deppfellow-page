## Introduction

This specific README is define the explanation of directories and files in `.docs` directory.

1. `design/` directory

This directory include all design interface for UI/UX file. Image provided in `.png` format.

2. `requirement/` directory

This directory define the project high-level requirement (`prd.md`), project architecture (`architecture.md`), epic and story (`epics.md`) ,and sprint status (`sprint-status.yml`).

3. `stories/` directory

This directory define the stories implementation guidances and tasks for each of epics defined for the project.

4. `implementation/` directory

This directory provide the documentations and decision after each tasks in specific epics is implemented. It is a documentation product after completing a story/epics for documentation purpose.

5. `docs.md` file

This file recording all question and understanding from chat conversation with AI Agent, including how-to and what, questions of specific topic being discussed in chat conversation serving as a knowledge references for developers.

6. `solutions.md` file

This file record all bugs encountered during development and implementation, and its solution for specific bugs. Serving as knowledge reference for developers.

## Rule of Documentations

The rule for writing, appending, and documenting in each files or directories is as follows:

1. `design/` specific purpose is for all UI/UX related. Only store `.png`, `.jpg`, `jpeg`, `.webp` for images and `.md` for documentation about UI/UX implementation. Serving as developer reference.

2. `requirement/` only serving as high-level and technical requirements for project define before the project is initiated. **DO  NOT CREATING OR APPENDING IN THIS FILE AFTER THE PROJECT IS RUNNING**

3. `stories/` only for tasks and guidances for each implementation of epics/stories based from `requirement/sprint-status.yml`. It serves as developer guidance for implementing and completing tasks. **IMPLEMENTATION OF STORIES SHOULD MATCH AND CONSIDER THE ARCHITECTURE AND EPICS DEFINE IN `requirements/architecture.md` AND `requirements/epics.md`, respectively**.

4. `implementation/` only serve as after-product of implementation in each of the epics/tasks. It is documenting all implementation being done for those particular epics. **ONLY ADD NEW DOCUMENTATION MARKDOWN FILE FOR EACH EPICS AFTER THE IMPLEMENTATION STORIES IS DONE**.

5. `docs.md` store all developer-question during the implementation, for knowledge references. If developer asking to save the "question/answer" detail for reference, append this file.

6. `solutions.md` store all bugs and its solutions encountered during implementation. If developer asking to save the "bug/solution" detail for reference, append this file.