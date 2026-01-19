// Example controller structure
// This will be used as a template for creating other controllers

const exampleController = {
  // GET all items
  getAll: async (req, res) => {
    try {
      // Implementation here
      res.status(200).json({ 
        success: true, 
        message: 'Controller working',
        data: []
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // GET single item by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      // Implementation here
      res.status(200).json({ 
        success: true, 
        data: null
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // CREATE new item
  create: async (req, res) => {
    try {
      const data = req.body;
      // Implementation here
      res.status(201).json({ 
        success: true, 
        message: 'Created successfully',
        data: null
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // UPDATE existing item
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      // Implementation here
      res.status(200).json({ 
        success: true, 
        message: 'Updated successfully',
        data: null
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // DELETE item
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      // Implementation here
      res.status(200).json({ 
        success: true, 
        message: 'Deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
};

module.exports = exampleController;
