const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const employeeRoleSchema = new Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: ObjectId,
    required: true,
  },
  companyId: {
    type: ObjectId,
    required: true,
  },

  LA: {
    fullName: {
      type: String,
      default: "List All Employees",
    },
    description: {
      type: String,
      default: "View a full list of employees and access thier profiles.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  EP: {
    fullName: {
      type: String,
      default: "Edit Profiles",
    },
    description: {
      type: String,
      default: "Update employee information (roles, wages, ratings etc.).",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  ER: {
    fullName: {
      type: String,
      default: "Employee Roles",
    },
    description: {
      type: String,
      default: "Create, and edit Employee Roles and permissions.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  AV: {
    fullName: {
      type: String,
      default: "Availability",
    },
    description: {
      type: String,
      default: "See Employee availability.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  SE: {
    fullName: {
      type: String,
      default: "Shift Exchange",
    },
    description: {
      type: String,
      default:
        "Allow other employees to approve or deny shift exchanges between employees.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  SC: {
    fullName: {
      type: String,
      default: "Scheduling",
    },
    description: {
      type: String,
      default: "Grant access to create, edit, and post schedules.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  BP: {
    fullName: {
      type: String,
      default: "Blueprint",
    },
    description: {
      type: String,
      default: "Allow employees to create schedule blueprints.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  EX: {
    fullName: {
      type: String,
      default: "Exceptions",
    },
    description: {
      type: String,
      default:
        "Employees can create exceptions in order to prevent us from auto-scheduling a particular day.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  ML: {
    fullName: {
      type: String,
      default: "Manager Logs",
    },
    description: {
      type: String,
      default:
        "Give access to employees to create, and fill out manager logs for your business.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  RP: {
    fullName: {
      type: String,
      default: "Reports",
    },
    description: {
      type: String,
      default: "Full detailed reports, and analytics of scheduling.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  PL: {
    fullName: {
      type: String,
      default: "Print Lineup",
    },
    description: {
      type: String,
      default:
        "Give the option to print a lineup sheet for the day or for the week.",
    },
    selected: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
});

module.exports = mongoose.model("EmployeeRole", employeeRoleSchema);
