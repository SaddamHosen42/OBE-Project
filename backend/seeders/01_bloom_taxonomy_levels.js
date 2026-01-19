const db = require('../config/database');

/**
 * Seed Bloom's Taxonomy Levels
 * Based on Bloom's Revised Taxonomy (6 levels)
 */
const seedBloomTaxonomyLevels = async () => {
  try {
    console.log('🌱 Seeding Bloom Taxonomy Levels...');

    const bloomLevels = [
      {
        level_number: 1,
        name: 'Remember',
        description: 'Recall facts and basic concepts. Retrieving, recognizing, and recalling relevant knowledge from long-term memory.',
        keywords: 'Define, Duplicate, List, Memorize, Recall, Repeat, Reproduce, State, Name, Identify, Label, Recognize, Match, Select, Describe'
      },
      {
        level_number: 2,
        name: 'Understand',
        description: 'Explain ideas or concepts. Constructing meaning from oral, written, and graphic messages through interpreting, exemplifying, classifying, summarizing, inferring, comparing, and explaining.',
        keywords: 'Classify, Describe, Discuss, Explain, Identify, Locate, Recognize, Report, Select, Translate, Paraphrase, Summarize, Interpret, Illustrate, Convert, Defend, Distinguish, Estimate, Extend, Generalize, Give Examples, Infer, Predict, Rewrite'
      },
      {
        level_number: 3,
        name: 'Apply',
        description: 'Use information in new situations. Carrying out or using a procedure through executing or implementing.',
        keywords: 'Execute, Implement, Solve, Use, Demonstrate, Interpret, Operate, Schedule, Sketch, Apply, Choose, Construct, Develop, Interview, Make Use of, Organize, Experiment with, Plan, Select, Model, Identify, Compute, Prepare, Produce, Show, Employ'
      },
      {
        level_number: 4,
        name: 'Analyze',
        description: 'Draw connections among ideas. Breaking material into constituent parts, determining how the parts relate to one another and to an overall structure or purpose through differentiating, organizing, and attributing.',
        keywords: 'Differentiate, Organize, Relate, Compare, Contrast, Distinguish, Examine, Experiment, Question, Test, Appraise, Break Down, Calculate, Categorize, Criticize, Diagram, Discriminate, Illustrate, Infer, Outline, Point Out, Select, Separate, Subdivide'
      },
      {
        level_number: 5,
        name: 'Evaluate',
        description: 'Justify a stand or decision. Making judgments based on criteria and standards through checking and critiquing.',
        keywords: 'Appraise, Argue, Defend, Judge, Select, Support, Value, Critique, Weigh, Assess, Check, Choose, Compare, Conclude, Decide, Evaluate, Prioritize, Rate, Recommend, Test, Measure, Revise, Score, Justify, Estimate, Discriminate'
      },
      {
        level_number: 6,
        name: 'Create',
        description: 'Produce new or original work. Putting elements together to form a coherent or functional whole; reorganizing elements into a new pattern or structure through generating, planning, or producing.',
        keywords: 'Design, Assemble, Construct, Conjecture, Develop, Formulate, Author, Investigate, Compose, Plan, Prepare, Produce, Project, Invent, Generate, Integrate, Modify, Rearrange, Reorganize, Revise, Rewrite, Summarize, Tell, Write, Build, Combine, Compile, Create, Devise, Hypothesize, Make, Originate, Propose'
      }
    ];

    // Check if data already exists
    const [existing] = await db.query('SELECT COUNT(*) as count FROM bloom_taxonomy_levels');
    
    if (existing[0].count > 0) {
      console.log('⚠️  Bloom Taxonomy Levels already seeded. Skipping...');
      return;
    }

    // Insert bloom taxonomy levels
    const query = `
      INSERT INTO bloom_taxonomy_levels 
      (level_number, name, description, keywords, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    for (const level of bloomLevels) {
      await db.query(query, [
        level.level_number,
        level.name,
        level.description,
        level.keywords
      ]);
    }

    console.log('✅ Successfully seeded 6 Bloom Taxonomy Levels');
  } catch (error) {
    console.error('❌ Error seeding Bloom Taxonomy Levels:', error.message);
    throw error;
  }
};

module.exports = seedBloomTaxonomyLevels;
