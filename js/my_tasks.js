import Request from "./modules/request.js";
import Task from "./modules/task.js";

function updateCounts() {
  document.querySelectorAll(".kanban-column").forEach((col) => {
    const list = col.querySelector(".task-list");
    const countEl = col.querySelector(".count");
    if (list && countEl) {
      countEl.textContent = list.querySelectorAll(".task-card").length;
    }
  });
}

function getBadgeColor(item) {
  let badgeClass = "bg-secondary";
  if (item.priority === "High") badgeClass = "bg-danger";
  else if (item.priority === "Medium") badgeClass = "bg-info";
  else if (item.priority === "Low") badgeClass = "bg-warning";
  return badgeClass;
}

$(async function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  let id = loggedInUser?.id;
  let tasks = await Task.employeeTasks(id);

  $.each(
    tasks.filter((el) => el.status == "Completed"),
    function (index, item) {
      let badgeClass = getBadgeColor(item);
      let card = `<div class="card task-card open-task" id="task-${
        item.id
      }" data-task='${JSON.stringify(item)}'>
                    <div class="card-body" id="${item.id}">
                        <span class="badge ${badgeClass} badge-custom">${
        item.priority
      }</span>
                        <span class="badge bg-success badge-custom badge-completed ms-1">Completed ✅</span>

                        <h6 class="mt-2">${item.title}</h6>
                        <p class="text-muted small mb-2">${item.description}</p>
                        <small class="badge bg-secondary rounded-pil badge-custom">${
                          item.deadline
                        }</small>

                    </div>
                </div>`;
      $("#done").append(card);
    }
  );
  $.each(
    tasks.filter((el) => el.status == "In Progress"),
    function (index, item) {
      let badgeClass = getBadgeColor(item);
      let card = `<div class="card task-card open-task"  id="task-${
        item.id
      }" data-task='${JSON.stringify(item)}'>
                    <div class="card-body" id="${item.id}">
                          <div class="d-flex justify-content-between">
                             <span class="badge ${badgeClass} badge-custom">${
        item.priority
      }</span>
                          </div>
                        <h6 class="mt-2">${item.title}</h6>
                        <p class="text-muted small mb-2">${item.description}</p>
                        <small class="badge bg-secondary rounded-pil badge-custom">${
                          item.deadline
                        }</small>

                    </div>
                </div>`;

      $("#in_progress").append(card);

      let daysLeft = daysUntil(item.deadline);
      if (daysLeft === 0) {
        $(`#task-${item.id}`).prepend(
          '<div class="alert alert-warning text-center fw-bold m-3 mb-1 p-1" role="alert">⚠️ Due Today!</div>'
        );
      } else if (daysLeft === 1) {
        $(`#task-${item.id}`).prepend(
          '<div class="alert alert-info text-center fw-bold p-1 m-3 mb-1" role="alert">⏳ Due Tomorrow</div>'
        );
      } else if (daysLeft === 2) {
        $(`#task-${item.id}`).prepend(
          `<div class="alert alert-secondary text-center fw-bold p-1 m-3 mb-1" role="alert">📅 Due in ${daysLeft} days</div>`
        );
      }
      if (isOverdue(item.deadline)) {
        $(`#task-${item.id}`).prepend(
          '<div class="alert alert-danger text-center fw-bold p-2 m-3 mb-1" role="alert">🚨 Overdue Task!</div>'
        );
      }
    }
  );
  $.each(
    tasks.filter((el) => el.status == "To Do"),
    function (index, item) {
      let badgeClass = getBadgeColor(item);

      let card = `<div class="card task-card open-task" id="task-${
        item.id
      }" data-task='${JSON.stringify(item)}'>
                    <div class="card-body" id="${item.id}">
                          <div class="d-flex justify-content-between">
                            <span class="badge ${badgeClass} badge-custom">${
        item.priority
      }</span>
                          </div>
                        <h6 class="mt-2">${item.title}</h6>
                        <p class="text-muted small mb-2">${item.description}</p>
                        <small class="badge bg-secondary rounded-pil badge-custom">${
                          item.deadline
                        }</small>

                    </div>
                </div>`;
      $("#to_do").append(card);
      let daysLeft = daysUntil(item.deadline);

      if (daysLeft === 0) {
        $(`#task-${item.id}`).prepend(
          '<div class="alert alert-warning text-center fw-bold m-3 mb-1 p-1" role="alert">⚠️ Due Today!</div>'
        );
      } else if (daysLeft === 1) {
        $(`#task-${item.id}`).prepend(
          '<div class="alert alert-info text-center fw-bold p-1 m-3 mb-1" role="alert">⏳ Due Tomorrow</div>'
        );
      } else if (daysLeft === 2) {
        $(`#task-${item.id}`).prepend(
          `<div class="alert alert-secondary text-center fw-bold p-1 m-3 mb-1" role="alert">📅 Due in ${daysLeft} days</div>`
        );
      }

      if (isOverdue(item.deadline)) {
        $(`#task-${item.id}`).prepend(
          '<div class="alert alert-danger text-center fw-bold m-3 mb-1 p-2" role="alert">🚨 Overdue Task!</div>'
        );
      }
    }
  );

  $.each(
    tasks.filter((el) => el.status == "Blocked"),
    function (index, item) {
      let badgeClass = getBadgeColor(item);
      let card = `<div class="card task-card open-task" id="task-${
        item.id
      }" data-task='${JSON.stringify(item)}'>
                    <div class="card-body" id="${item.id}">
                        <span class="badge ${badgeClass} badge-custom">${
        item.priority
      }</span>

                        <h6 class="mt-2">${item.title}</h6>
                        <p class="text-muted small mb-2">${item.description}</p>
                        <small class="badge bg-secondary rounded-pil badge-custom">${
                          item.deadline
                        }</small>

                    </div>
                </div>`;
      $("#blocked").append(card);
    }
  );
  updateCounts();
  function isOverdue(deadline) {
    const today = new Date();
    const dueDate = new Date(deadline);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return today > dueDate;
  }
  function daysUntil(deadline) {
    const today = new Date();
    const due = new Date(deadline);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  function updateStatus(tid, status) {
    console.log(tid);
    let task = tasks.find((el) => (+el.id === +tid));
    console.log(task)
    task.status = status;
    Task.updateTask(task, id);
  }

  $(".task-list")
    .sortable({
      cursor: "default",
      connectWith: ".task-list",
      items: "> .task-card",
      placeholder: "drag-placeholder",
      forcePlaceholderSize: true,
      dropOnEmpty: true,
      tolerance: "pointer",
      helper: "clone",
      appendTo: "body",
      start: function (e, ui) {
        ui.helper.css("cursor", "pointer");
        ui.placeholder.height(ui.item.outerHeight());
      },
      stop: function (e, ui) {
        ui.item.css("cursor", "pointer");
      },
      over: function () {
        $(this).addClass("is-over");
      },
      out: function () {
        $(this).removeClass("is-over");
      },
      receive: function (e, ui) {
        updateCounts();
        console.log($(this).attr("id"));
        let card = ui.item;
        if ($(this).attr("id") === "done") {
          card
            .find(".card-body")
            .prepend(
              '<span class="badge bg-success badge-custom badge-completed mb-1">Completed ✅</span>'
            );
          updateStatus(card.find(".card-body").attr("id"), "Completed");
        } else {
          card.find(".badge-completed").remove();
        }

        if ($(this).attr("id") === "in_progress") {
          updateStatus(card.find(".card-body").attr("id"), "In Progress");
        }

        if ($(this).attr("id") === "to_do") {
          updateStatus(card.find(".card-body").attr("id"), "To Do");
        }

        if ($(this).attr("id") === "blocked") {
          updateStatus(card.find(".card-body").attr("id"), "Blocked");
        }
      },
      update: updateCounts,
    })
    .disableSelection();

  updateCounts();

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
      $("#taskPriority").removeClass("bg-waning");
      $("#taskPriority").addClass("bg-info");
    }
    $("#taskStatus").text(task.status);
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

    // Clear old history
    $("#historyList").empty();
    if (task.history && task.history.length > 0) {
      task.history.forEach((h) => {
        $("#historyList").append(`
      <div class="d-flex mb-3">
        <div class="flex-shrink-0">
          <i class="bi bi-clock" fs-4 text-secondary"></i>
        </div>
        <div class="flex-grow-1 ms-3">
          <div class="bg-light p-3 rounded shadow-sm">
            <div class="d-flex justify-content-between">
              <h6 class="mb-1 fw-semibold text-muted">${h.action}</h6>
              <small class="text-muted">${h.at}</small>
            </div>
            <p class="mb-0 text-muted">By <strong>${h.by}</strong></p>
          </div>
        </div>
      </div>
    `);
      });
    } else {
      $("#historyList").append(`<p class="muted">No history yet</p>`);
    }

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
      $("#attachmentsList").append(`<li class="muted">No attachments</li>`);
    }
    // Clear previous comments
    let commentsList = $("#commentsList");
    commentsList.empty();

    // Append comments dynamically
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
                <small class="text-muted">${c.at}</small>
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

    // Show modal
    let modal = new bootstrap.Modal(document.getElementById("taskModal"));
    modal.show();
  });

  let today = new Date().toISOString().split("T")[0];
  $("#deadlineDate").attr("min", today);

  $("#markCompletedBtn").on("click", function () {
    $("#completionDateModal").modal("show");
  });

  $("#saveCompletionDate").on("click", async function () {
    let date = $("#deadlineDate").val();

    if (!date) {
      toastr.error("Choose a valid date");
      return;
    }

    await Request.saveEmployeeRequest(
      id,
      "DeadlineExtension",
      {
        requestedDate: $("#deadlineDate").val(),
        reason: "urgent",
        taskId: $("#taskId").val(),
      },
      "Pending"
    );
    toastr.success("Request sent successfully");

    $("#completionDateModal").modal("hide");
  });
});
