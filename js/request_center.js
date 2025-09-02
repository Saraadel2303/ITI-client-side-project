import Task from "./modules/task.js";
import Request from "./modules/request.js";

$(document).ready(async function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  let id = loggedInUser?.id;
  let requests = await Request.employeeRequests(id);

  let table = $("#requestsTable").DataTable({
    data: requests,
    columns: [
      { data: "id" },
      { data: "type" },
      {
        data: "status",
        render: function (data, type, row) {
          let color = "";
          if (data === "Pending") color = "pending";
          else if (data === "Approved") color = "approved";
          else if (data === "Rejected") color = "rejected";
          return `<span class="${color}">${data}</span>`;
        },
      },
      { data: "createdAt" },
      { data: "decidedAt" },
      { data: "managerComment" },
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
  });

  let lastId = 0;

  $.getJSON("/data/data1.json", function (data) {
    if (data.requests.length > 0) {
      lastId = data.requests[data.requests.length - 1].id;
    }
  });

  $("#requestForm").validate({
    rules: {
      type: {
        required: true,
      },
      reason: {
        required: true,
        minlength: 5,
      },
      requestedDate: {
        required: true,
      },
    },
    messages: {
      type: {
        required: "Please enter request type",
      },
      reason: {
        required: "Please enter reason",
        minlength: "Notes must be at least 5 characters",
      },
      requestedDate: {
        required: "Please enter request date",
      },
    },
    errorElement: "div",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      element.closest(".mb-3").append(error);
    },
    highlight: function (element) {
      console.log(request_form.type.value);
      console.log(request_form.notes.value);
      $(element).addClass("is-invalid").removeClass("is-valid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
    submitHandler: function (form, e) {
      e.preventDefault();
      let newRow = {
        id: lastId,
        employeeId: id,
        type: $("#type").val(),
        createdAt: new Date().toISOString().split("T")[0],
        status: "Pending",
        reason: "",
        decidedAt: "",
        managerComment: "",
      };
      console.log(newRow);
      table.row.add(newRow).draw(false);
      $("#history-tab").addClass("active");
      $("#history").addClass("active show");
      $("#home-tab").removeClass("active");
      $("#send").removeClass("active show");

      form.reset();
    },
  });

  let tasks = await Task.employeeTasks(id);

  console.log(tasks);

  $(".type-field").hide();

  $("#type").on("change", function () {
    let selected = $(this).val();

    $(".type-field").hide();
    $(`.type-field[data-type*='${selected}']`).show();
  });

  let $taskSelect = $("#taskId");
  tasks.forEach((task) => {
    $taskSelect.append(
      $("<option>", {
        value: task.id,
        text: `Task ${task.id} - ${task.title}`,
      })
    );
  });

  let weekIndex = getWeekIndexInYear();

  let quotas = {
    late: {
      used: requests.filter(
        (el) =>
          new Date(el.payload.requestedDate).getMonth() + 1 ==
            new Date().getMonth() + 1 && el.type == "Late"
      ).length,
      limit: 2,
      period: "Month",
    },
    wfh: {
      used: requests.filter(
        (el) => el.payload.weekIndex == weekIndex && el.type == "WFH"
      ).length,
      limit: 2,
      period: "Week",
    },
  };
  console.log("Week index in year:", quotas);

  $("#lateBadge").text(`${quotas.late.used} / ${quotas.late.limit}`);
  $("#wfhBadge").text(`${quotas.wfh.used} / ${quotas.wfh.limit}`);

  if (quotas.late.used < quotas.late.limit / 2) {
    $("#lateBadge").addClass("bg-success");
  }

  if (quotas.late.used == quotas.late.limit / 2) {
    $("#lateBadge").addClass("bg-warning");
    $("#late-progress-bar").addClass("bg-warning").addClass("w-50");
  }

  if (quotas.late.used == quotas.late.limit) {
    $("#lateBadge").addClass("bg-danger");
    $("#late-progress-bar").addClass("w-100").addClass("bg-danger");
  }

  if (quotas.wfh.used < quotas.wfh.limit / 2) {
    $("#wfhBadge").addClass("bg-success");
  }

  if (quotas.wfh.used == quotas.wfh.limit / 2) {
    $("#wfhBadge").addClass("bg-warning");
    $("#wfh-progress-bar").addClass("w-50").addClass("bg-warning");
  }

  if (quotas.wfh.used == quotas.wfh.limit) {
    $("#wfhBadge").addClass("bg-danger");
    $("#wfh-progress-bar").addClass("w-100").addClass("bg-danger");
  }

  function getWeekIndexInYear(date = new Date()) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    const dayNum = d.getUTCDay() || 7;

    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekIndex = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

    return weekIndex;
  }
  console.log(
    "Week index in year:",
    new Date().getMonth() + 1,
    new Date("2025-08-11").getMonth() + 1
  );
});
