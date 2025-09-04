import Task from "./modules/task.js";

$(async function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  let id = loggedInUser?.id;
  let tasks = await Task.employeeTasks(id);

  let table = $("#tasksTable").DataTable({
    data: tasks,
    columns: [
      {
        data: null,
        orderable: false,
        ordering: false,
        render: function (data, type, row) {
          return `<input type="checkbox" class="row-select" data-id="${row.id}">`;
        },
      },
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
    select: {
      style: "multi",
      selector: "td:first-child",
    },
    columnDefs: [
      {
        targets: 0,
        orderable: false,
        className: "select-checkbox",
        defaultContent: "",
      },
      { targets: 1, type: "priority" },
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
    destroy: true,
    lengthChange: false,
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

    $("#attachmentsList").empty();
    if (task.attachments && task.attachments.length > 0) {
      task.attachments.forEach((att) => {
        $("#attachmentsList").append(`
        <li class="mb-2">
          <a href="${att.url}" target="_blank" class="d-flex align-items-center text-decoration-none">
            <i class="bi bi-file-earmark-text me-2 text-primary"></i>
            <span>${att.name}</span>
          </a>
        </li>
      `);
      });
    } else {
      $("#attachmentsList").append(
        `<li class="text-muted">No attachments</li>`
      );
    }
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

  check();
});

function check() {
  $("#selectAll").on("click", function () {
    $(".row-select").prop("checked", this.checked);
  });
  $("#bulkDone").on("click", function () {
    console.log("approve");
    const table = $("#tasksTable").DataTable();

    let ids = $(".row-select:checked")
      .map(function () {
        return $(this).data("id");
      })
      .get();

    if (ids.length === 0) {
      toastr.warning("No tasks selected!");
      return;
    }

    table.rows().every(function () {
      let rowData = this.data();
      let rowId = rowData[1];
      console.log(ids.includes(Number(rowId)), rowData[1]);

      if (ids.includes(Number(rowId))) {
        rowData[4] = "Completed";
        this.data(rowData).invalidate();
      }
    });

    table.draw(false);
    $("input.row-select", table.rows().nodes()).prop("checked", false);
    $("#selectAll").prop("checked", false);

    toastr.success("Completed tasks: " + ids.join(", "));
  });
}
