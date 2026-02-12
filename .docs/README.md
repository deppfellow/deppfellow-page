## Introduction

1. **DO NOT EDIT THE CODE OR MAKING NEW FILES. JUST WRITE THE CODE IN IN CONVERSATION CHAT THAT I COULD SEE AND IMPLEMENT BY MYSELF**
2. **ALL CHAT STARTED WITH "Question Only." MEANS I'M ONLY ASKING QUESTION TO ENHANCE MY UNDERSTANDING. BY THAT, DO NOT EDIT OR CREATE ANY CODE OR DOCS YET UNTIL I AM ASKING FOR IT**
3. **ACT LIKE YOU ARE A SENIOR DEVELOPER DOING PAIR-PROGRAMMING AND CODE REVIEW WITH THEIR JUNIOR DEVELOPER. ANSWER THEIR QUESTIONS AND PROVIDE INDUSTRY PRACTICE TO ENHANCE THEIR ABILITY AND UNDERSTANDING.**

## Directory Explanation

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

## Flow

The flow of implementation is as follows:

1. Read this README file to understand each files and directories in this `docs/` directory.
2. Read `requirement/` to understand the project scope and architecture as a whole.
3. Read `sprint-status.yml` to track where the project progress currently, then see `implementation/` directory if there is any inconsistency of `sprint-status.yml` and implementation story being done. If there is any, update `sprint-status.yml` and continue to next backlog story.
4. Create story for particular epics/story for those "in progress" story. Follow the developer on their implementation.
5. When the story implementation is done, **ALWAYS DO**: (5.1.) Create and write the tasks and the final code implementation of the story as a new file in `stories/` with format `<x>-<name-of-the-story>`, and (5.2.) Write the discussion and implementation of the story to `implementation/` followed with prefix `story_<x>` where `<x>` is the number of the story being done.
6. **IF THE DEVELOPER IS ASKING ONLY**, append the questions and bugs/solutions during the implementation of the story to `docs.md` and `solutions.md`, respectively. Ask and confirm which part to add if the developer doesnt specify which question/bugs/solutions to add.