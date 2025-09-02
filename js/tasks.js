import Task from "./modules/task.js";

$(async function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  let id = loggedInUser?.id;
  let tasks = await Task.employeeTasks(id);

  let table = $("#tasksTable").DataTable({
    data: tasks,
    columns: [
      { data: "id" },
      { data: "title" },
      { data: "priority" },
      { data: "status" },
      { data: "deadline" },
      {
        data: null,
        render: function (data, type, row) {
          return `
          <button class="btn btn-sm open-task open-btn"
            data-task='${JSON.stringify(row)}'>
            View
          </button>`;
        },
      },
    ],
    pagingType: "simple_numbers",
    language: {
      paginate: {
        previous: '<i class="fa-solid fa-arrow-left"></i>',
        next: '<i class="fa-solid fa-arrow-right"></i>',
      },
    },
    info: false,
    lengthChange: false,
    pageLength: 10,
    responsive: true,
    scrollX: false,
    autoWidth: true,
    columnDefs: [
      { targets: 1, type: "priority" }, // apply to Priority column
    ],
    order: [[1, "asc"]],
  });

  $.fn.dataTable.ext.type.order["priority-pre"] = function (data) {
    switch (data) {
      case "High":
        return 0;
      case "Medium":
        return 1;
      case "Low":
        return 2;
      default:
        return 99;
    }
  };

  $("#tasksTable").DataTable({
    retrieve: true,
    columnDefs: [{ type: "priority", targets: [2] }],
  });

  $(document).on("click", ".open-task", function () {
    let task = $(this).data("task");

    $("#taskId").text(task.id);
    $("#taskTitle").text(task.title);
    $("#taskPriority").text(task.priority);
    if (task.priority == "High") {
      $("#taskPriority").removeClass("bg-warning");
      $("#taskPriority").removeClass("bg-info");
      $("#taskPriority").addClass("bg-danger");
    } else if (task.priority == "Low") {
      $("#taskPriority").removeClass("bg-danger");
      $("#taskPriority").removeClass("bg-info");
      $("#taskPriority").addClass("bg-warning");
    } else if (task.priority == "Medium") {
      $("#taskPriority").removeClass("bg-danger");
      $("#taskPriority").removeClass("bg-warning");
      $("#taskPriority").addClass("bg-info");
    }
    $("#taskStatus").text(task.status);
    if (task.status == "To Do") {
      $("#taskStatus").removeClass(
        "bg-warning-subtle text-warning bg-success-subtle text-success"
      );
      $("#taskStatus").addClass("bg-primary-subtle text-primary");
    }
    if (task.status == "In Progress") {
      $("#taskStatus").removeClass(
        "bg-success-subtle text-success bg-success-subtle text-success"
      );

      $("#taskStatus").addClass("bg-warning-subtle text-warning");
    }
    if (task.status == "Completed") {
      $("#taskStatus").removeClass(
        "bg-warning-subtle text-warning bg-primary-subtle text-primary"
      );
      $("#taskStatus").addClass("bg-success-subtle text-success");
    }

    $("#taskDeadline").text(task.deadline);
    $("#taskCreated").text(task.createdAt);
    $("#taskDesc").text(task.description || "No description");

    let commentsList = $("#commentsList");
    commentsList.empty();

    if (task.comments && task.comments.length > 0) {
      task.comments.forEach((c) => {
        let commentHTML = `
        <div class="d-flex mb-3">
          <div class="flex-shrink-0">
            <i class="bi bi-person-circle fs-3 text-secondary"></i>
          </div>
          <div class="flex-grow-1 ms-3">
            <div class="bg-light p-3 rounded shadow-sm">
              <div class="d-flex justify-content-between">
                <h6 class="mb-1 fw-semibold">${c.by}</h6>
                <small>${c.at}</small>
              </div>
              <p class="mb-0">${c.text}</p>
            </div>
          </div>
        </div>
      `;
        commentsList.append(commentHTML);
      });
    } else {
      commentsList.append(`<p class="muted">No comments yet.</p>`);
    }

    let modal = new bootstrap.Modal(document.getElementById("taskModal"));
    modal.show();
  });
});
