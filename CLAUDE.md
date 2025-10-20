# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Learning Management System (LMS) focused on cybersecurity education. The system is designed to provide a progressive learning experience through multiple stages, each with curated video content and assessment questions.

## Content Structure

### Stage Progression System
The course follows a 6-stage progression model:
- **General Stage**: Foundation concepts (25 questions)
- **Stage 1**: Cybersecurity Basics (15 questions)
- **Stage 2**: Intermediate Concepts (15 questions)
- **Stage 3**: Advanced Topics (15 questions)
- **Stage 4**: Expert-Level Strategies (15 questions)
- **Final Stage**: Comprehensive assessment (25 questions)

### Question Bank Format
Questions are stored in `QUESTION.txt` following this structure:
- Multiple choice format (A/B/C/D)
- Single correct answer per question
- Organized by stage with clear section headers
- Total of 110 questions across all stages

### Video Resources
Video content is catalogued in `Video.txt` with:
- Title and YouTube link for each video
- Aligned with stage progression (Stages 1-4)
- Mix of foundational and advanced cybersecurity topics

## Content Guidelines

When working with questions:
- Maintain the existing format: question number, question text, 4 options (A-D), and answer
- Keep questions focused on cybersecurity concepts, tools, and best practices
- Ensure answer keys are accurate
- Questions should progressively increase in difficulty across stages

When adding or modifying video resources:
- Include full title and valid YouTube URL
- Align content with the appropriate stage level
- Verify video accessibility before adding

## Future Development Considerations

This repository currently contains educational content only. When developing the actual LMS application, consider:
- Database schema for questions, users, progress tracking, and video metadata
- User authentication and authorization
- Progress tracking across the 6-stage system
- Quiz/assessment delivery mechanism
- Video player integration
- Stage unlocking logic (sequential vs. open access)
- Analytics and reporting for learner progress
- Content management system for updating questions and videos
