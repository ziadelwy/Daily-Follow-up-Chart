if (window.location.pathname.includes("index.html")) {
    document.addEventListener("DOMContentLoaded", async function () {
        console.log("Page loaded, initializing static medicine table...");
        updateDate();
        loadDiagnosis();
        loadProblems();
        document.getElementById("fileNo").addEventListener("input", fetchChildData);
        
        document.getElementById("childName").addEventListener("input", function() {
            document.getElementById("childNameBack").value = this.value;
        });
        document.getElementById("dateBox").addEventListener("input", function() {
            document.getElementById("dateBack").value = this.value;
        });
        document.getElementById("dateBack").value = document.getElementById("dateBox").value;
        
        try {
            const medicines = await db.getMedicines();
            const medicineSelects = document.querySelectorAll('.custom-table select');
            medicineSelects.forEach(select => {
                while (select.options.length > 1) {
                    select.remove(1);
                }
                Object.values(medicines).forEach(medicine => {
                    const option = document.createElement('option');
                    option.value = medicine.medicineName;
                    option.textContent = medicine.medicineName;
                    select.appendChild(option);
                });
            });
        } catch (error) {
            console.error("Error loading medicines:", error);
        }

        document.getElementById("weight").addEventListener("input", function () {
            document.querySelectorAll(".custom-table tbody tr").forEach(row => {
                calculateFinalDosage(row.querySelector("input"));
            });
            updateTF(); 
            updateDR(); 
            updateRFL(); 
            updatePTNM(); 
            updateTCI(); 
            updateGIR(); 
            updatePTNA(); 
            updateMILK();
        });

        document.getElementById("mlPerKg").addEventListener("input", function () {
            updateTF(); 
            updateRFL(); 
            updateTCI(); 
            updateGIR(); 
            updatePTNA(); 
            checkMLPerKgWarning();
        });

        document.getElementById("feedingAmount").addEventListener("input", function () {
            updateMILK();
            updateRFL(); 
            updatePTNM();
            updateTCI(); 
            updateGIR(); 
            updatePTNA(); 

        });

        document.getElementById("feedingTime").addEventListener("change", function () {
            updateMILK(); 
            updateDR(); 
            updateRFL();
            updatePTNM(); 
            updateTCI(); 
            updateGIR(); 
            updatePTNA(); 
        });

        document.getElementById("milkType").addEventListener("change", function () {
            updateTCI();
        });

        document.getElementById('rflValue').addEventListener('input', function () {
            calculateRatePerHour();
            updateGIR();
            updatePTNA(); 
        });
        document.getElementById('feedingAmount').addEventListener('input', function () {
            calculateRatePerHour();
            updateMILK();
            updateRFL();
            updatePTNM();
            updateTCI();
            updateGIR(); 
            updatePTNA(); 

        });

        document.getElementById("fluidType").addEventListener("change", updateGIR);
        document.getElementById("ratePerHour").addEventListener("input", updateGIR);
    });

    window.onload = async function () {
        try {
            calculateRatePerHour(); 
            updateGIR(); 
            updatePTNA(); 

            const fileNo = document.getElementById("fileNo").value.trim();
            if (fileNo) {
                await fetchChildData();
            } else {
                resetFields();
            }
        } catch (error) {
            console.error("خطأ أثناء تحميل الصفحة:", error);
            alert("حدث خطأ أثناء تحميل الصفحة. تحقق من وحدة التحكم للتفاصيل.");
            resetFields();
        }
    };

    if (window.location.pathname.includes("index.html")) {
        window.addMedicineRow = function() {
            alert("تم تعطيل إضافة صفوف جديدة. الجدول الآن ثابت.");
        };
    }
}

if (window.location.pathname.includes("add_child.html")) {
    document.addEventListener("DOMContentLoaded", function () {
        loadBirthPlaces();
        generateFileNumber();
        prefillChildFormForEdit();
    });
}

if (window.location.pathname.includes("children_data.html")) {
    let allChildrenData = [];
    let filteredChildrenData = [];
    let currentPage = 1;
    const pageSize = 50;

    document.addEventListener("DOMContentLoaded", function () {
        loadChildrenData();
        const searchInput = document.getElementById('childrenSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentPage = 1;
                renderChildrenTable();
            });
        }
    });

    window.loadChildrenData = async function() {
        try {
            const childrenData = await db.getChildren();
            allChildrenData = Object.entries(childrenData).map(([id, child]) => ({ id, ...child }));
            
            // Update statistics
            updateChildrenStatistics(allChildrenData);
            
            renderChildrenTable();
        } catch (error) {
            console.error('Error loading children data:', error);
        }
    };

    function updateChildrenStatistics(children) {
        const total = children.length;
        const males = children.filter(child => child.childType === 'ابن').length;
        const females = children.filter(child => child.childType === 'بنت').length;

        const totalElement = document.getElementById('totalChildren');
        const maleElement = document.getElementById('maleChildren');
        const femaleElement = document.getElementById('femaleChildren');

        if (totalElement) totalElement.textContent = total;
        if (maleElement) maleElement.textContent = males;
        if (femaleElement) femaleElement.textContent = females;
    }

    function renderChildrenTable() {
        const tableBody = document.querySelector("#childrenTable tbody");
        const searchValue = (document.getElementById('childrenSearchInput')?.value || '').toLowerCase();
        filteredChildrenData = allChildrenData.filter(child =>
            (child.fileNo && child.fileNo.toString().includes(searchValue)) ||
            (child.motherName && child.motherName.toLowerCase().includes(searchValue)) ||
            (child.childType && child.childType.toLowerCase().includes(searchValue))
        );
        const totalPages = Math.ceil(filteredChildrenData.length / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        const startIdx = (currentPage - 1) * pageSize;
        const pageData = filteredChildrenData.slice(startIdx, startIdx + pageSize);
        tableBody.innerHTML = "";
        pageData.forEach(child => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${child.fileNo || ''}</td>
                <td>${child.motherName || ''}</td>
                <td>${child.childType || ''}</td>
                <td>${child.birthDate || ''}</td>
                <td>${child.entryDate || ''}</td>
                <td>${child.gestationalAge || ''}</td>
                <td>${child.birthPlace || ''}</td>
                <td>
                    <div style="display: flex; width: 100%; height: 100%; box-sizing: border-box;">
                        <button style="flex:1; width:100%; height:100%; background-color: #007bff; color: #fff; font-weight: bold; border: none; border-radius: 0; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 10pt; cursor: pointer;">تعديل</button>
                        <button style="flex:1; width:100%; height:100%; background-color: #e74c3c; color: #fff; font-weight: bold; border: none; border-radius: 0; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 10pt; cursor: pointer;" onclick="deleteChild('${child.id}')">حذف</button>
                    </div>
                </td>
            `;
            const editBtn = row.querySelector('button');
            editBtn.onclick = function() { editChild(child.id); };
            tableBody.appendChild(row);
        });
        renderChildrenPagination(totalPages);
    }

    function renderChildrenPagination(totalPages) {
        const paginationDiv = document.getElementById('childrenPagination');
        paginationDiv.innerHTML = '';
        if (totalPages <= 1) return;
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'السابق';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = function() { currentPage--; renderChildrenTable(); };
        paginationDiv.appendChild(prevBtn);
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = i;
                pageBtn.disabled = i === currentPage;
                pageBtn.onclick = function() { currentPage = i; renderChildrenTable(); };
                paginationDiv.appendChild(pageBtn);
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                paginationDiv.appendChild(dots);
            }
        }
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'التالي';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = function() { currentPage++; renderChildrenTable(); };
        paginationDiv.appendChild(nextBtn);
    }
}

if (window.location.pathname.includes("drug_data.html")) {
    document.addEventListener("DOMContentLoaded", function () {
        loadMedicines();
    });
}


function updateDate() {
    document.getElementById("dateBox").value = new Date().toLocaleDateString("ar-EG");
}

async function saveDropdownOption(selectId, value) {
    if (!value.trim()) return;
    const select = document.getElementById(selectId);
    
    try {
        const options = await db.getDropdownOptions(selectId);
        const existingOptions = Object.values(options).map(opt => opt.value);

        if (!existingOptions.includes(value) && !Array.from(select.options).some(option => option.value === value)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
            await db.saveDropdownOption(selectId, value);
        }
    } catch (error) {
        console.error('Error saving dropdown option:', error);
    }
}

function updateTF() {
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const mlPerKg = parseFloat(document.getElementById("mlPerKg").value) || 0;
    const tfValue = weight * mlPerKg;
    document.getElementById("tfValue").value = tfValue.toFixed(2);
    updateRFL();
    updateTCI();
    updateGIR(); 
    updatePTNA(); 

}

function updateMILK() {
    const feedingAmount = document.getElementById("feedingAmount").value;
    const feedingTime = parseFloat(document.getElementById("feedingTime").value) || 0;
    const feedingAmountValue = parseFloat(feedingAmount);

    if (!isNaN(feedingAmountValue) && feedingAmountValue > 0 && feedingTime > 0) {
        const milkValue = (24 / feedingTime) * feedingAmountValue;
        document.getElementById("milkValue").value = milkValue.toFixed(2);
    } else {
        document.getElementById("milkValue").value = "0";
    }
    updateRFL();
    updatePTNM();
    updateTCI();
    updateGIR(); 
    updatePTNA(); 

}

function updateDR() {
    const rows = document.querySelectorAll(".custom-table tbody tr");
    let totalDR = 0;

    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");
        const finalDosage = parseFloat(inputs[3].value) || 0;
        const timing = parseFloat(inputs[4].value);

        if (timing && timing > 0) {
            const drValue = (24 / timing) * finalDosage;
            totalDR += drValue;
        }
    });

    document.getElementById("drRemainingFl").value = totalDR.toFixed(2);
    updateRFL();
    calculateRatePerHour();
    updateGIR(); 
    updatePTNA(); 

}

function updateRFL() {
    const tfValue = parseFloat(document.getElementById("tfValue").value) || 0;
    const milkValue = parseFloat(document.getElementById("milkValue").value) || 0;
    const drValue = parseFloat(document.getElementById("drRemainingFl").value) || 0;

    const rflValue = tfValue - milkValue - drValue;
    document.getElementById("rflValue").value = rflValue >= 0 ? rflValue.toFixed(2) : "0";
    
    const rflWarning = document.getElementById("rflWarning");
    if (rflValue < 25) {
        rflWarning.textContent = "برجاء مراجعه كميه المحاليل";
        rflWarning.style.display = "block";
    } else {
        rflWarning.style.display = "none";
    }
    
    calculateRatePerHour();
    updateGIR();
    updatePTNA();
}

function updatePTNM() {
    const feedingAmount = parseFloat(document.getElementById("feedingAmount").value) || 0;
    const feedingTime = parseFloat(document.getElementById("feedingTime").value) || 0;
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const proteinFactor = 1.2;

    if (feedingAmount > 0 && feedingTime > 0 && weight > 0) {
        const dailyMilk = (24 / feedingTime) * feedingAmount;
        const proteinIntake = (dailyMilk * proteinFactor) / 100;
        const ptnmValue = proteinIntake / weight;
        document.getElementById("ptnMValue").value = ptnmValue.toFixed(2);
    } else {
        document.getElementById("ptnMValue").value = "0";
    }
}

function updateTCI() {
    const feedingAmount = document.getElementById("feedingAmount").value;
    const feedingAmountValue = parseFloat(feedingAmount);
    const feedingTime = parseFloat(document.getElementById("feedingTime").value) || 0;
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const milkType = document.getElementById("milkType").value;

    if (isNaN(feedingAmountValue) || feedingAmountValue <= 0 || feedingTime <= 0 || weight <= 0) {
        document.getElementById("tciValue").value = "0";
        return;
    }

    let caloricFactor;
    if (milkType === "1") {
        caloricFactor = 0.8;
    } else {
        caloricFactor = 0.67;
    }

    const dailyMilk = (24 / feedingTime) * feedingAmountValue;
    const totalCalories = dailyMilk * caloricFactor;
    const tciValue = totalCalories / weight;
    document.getElementById("tciValue").value = tciValue.toFixed(2);
}

function updateGIR() {
    const weight = parseFloat(document.getElementById("weight").value) || 0; 
    const ratePerHour = parseFloat(document.getElementById("ratePerHour").value) || 0; 
    const fluidType = document.getElementById("fluidType").value; 

    let glucoseConcentration = 0;
    switch (fluidType) {
        case "جلوكوز 10%":
            glucoseConcentration = 10; 
            break;
        case "كوكتيل 8%":
            glucoseConcentration = 8; 
            break;
        case "كوكتيل 10%":
            glucoseConcentration = 10; 
            break;
        case "كوكتيل 12%":
            glucoseConcentration = 12; 
            break;
        case "نيومنت":
            glucoseConcentration = 12.5;
            break;
        default:
            glucoseConcentration = 0; 
    }

    let girValue = 0;
    if (weight > 0 && ratePerHour > 0 && glucoseConcentration > 0) {
        girValue = (glucoseConcentration * ratePerHour) / (weight * 6);
    }

    document.getElementById("girValue").value = girValue.toFixed(2); 
}

function calculateAge(birthDate, admissionDate) {
    const birth = new Date(birthDate);
    const admission = new Date(admissionDate);
    const today = new Date();

    const ageDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    const stayDays = Math.floor((today - admission) / (1000 * 60 * 60 * 24));

    document.getElementById("age").value = ageDays;
    document.getElementById("days").value = stayDays;
}

async function loadMedicineTable(medicines = []) {
    const rows = document.querySelectorAll(".custom-table tbody tr");
    medicines.forEach((med, i) => {
        if (rows[i]) {
            const select = rows[i].querySelector("select");
            const inputs = rows[i].querySelectorAll("input");
            if (select && med.medicineName) {
                select.value = med.medicineName;
            }
            if (inputs[0]) inputs[0].value = med.serialNumber || "";
            if (inputs[1]) inputs[1].value = med.concentrationInMl || "";
            if (inputs[2]) inputs[2].value = med.finalDilution || "";
            if (inputs[3]) inputs[3].value = med.dosage || "";
            if (inputs[4]) inputs[4].value = med.finalDosage || "";
            if (inputs[5]) inputs[5].value = med.timing || "";
            if (inputs[6]) inputs[6].value = med.method || "";
        }
    });
}

async function addMedicineRow(data = {}) {
    console.log("Adding a new row...");
    const tbody = document.querySelector(".custom-table tbody");
    const row = document.createElement("tr");
    
    try {
        const medicines = await db.getMedicines();

    let options = '<option value="">-- اختر دواء --</option>';
        Object.values(medicines).forEach(med => {
        options += `<option value="${med.medicineName}" ${med.medicineName === data.medicineName ? 'selected' : ''}>${med.medicineName}</option>`;
    });

    row.innerHTML = `
        <td><input type="number" value="${data.serialNumber || ''}"></td>
        <td><select onchange="fetchMedicineData(this)">${options}</select></td>
        <td><input type="number" value="${data.concentrationInMl || ''}" oninput="calculateFinalDosage(this); updateDR(); updateRFL();"></td>
        <td><input type="number" value="${data.finalDilution || ''}" oninput="calculateFinalDosage(this); updateDR(); updateRFL();"></td>
        <td><input type="number" value="${data.dosage || ''}" oninput="calculateFinalDosage(this); updateDR(); updateRFL();"></td>
        <td><input type="number" value="${data.finalDosage || ''}" readonly></td>
        <td><input type="number" value="${data.timing || ''}" oninput="updateDR(); updateRFL();"></td>
        <td><input type="text" value="${data.method || ''}"></td>
        <td><button class="delete-btn" onclick="deleteMedicineRow(this)">🗑</button></td>
    `;
    tbody.appendChild(row);

    if (data.medicineName) {
        calculateFinalDosage(row.querySelector("input[type='number']"));
    }
    updateDR();
    updateRFL();
        updateGIR();
        updatePTNA();

    console.log("Row added successfully.");
    } catch (error) {
        console.error("Error adding medicine row:", error);
    }
}

async function fetchMedicineData(select) {
    const medicineName = select.value;
    try {
        const medicines = await db.getMedicines();
        const medicine = Object.values(medicines).find(m => m.medicineName === medicineName);

        const row = select.closest("tr");
        const inputs = row.querySelectorAll("input");
        console.log("fetchMedicineData: inputs found:", inputs.length, inputs);

        if (medicine) {
            if (inputs[0]) inputs[0].value = medicine.concentrationInMl || "";
            else console.warn("concentrationInMl input missing");
            if (inputs[1]) inputs[1].value = medicine.finalDilution || "";
            else console.warn("finalDilution input missing");
            if (inputs[2]) inputs[2].value = medicine.dosage || "";
            else console.warn("dosage input missing");
            if (inputs[4]) inputs[4].value = medicine.timing || "";
            else console.warn("timing input missing");
            if (inputs[5]) inputs[5].value = medicine.method || "";
            else console.warn("method input missing");
            calculateFinalDosage(select);
            updateDR();
            updateRFL();
            updateGIR();
            updatePTNA();
        } else {
            inputs.forEach((input, idx) => {
                if (!input.readOnly && idx !== 0) {
                    input.value = "";
                }
            });
            updateDR();
            updateRFL();
            updateGIR();
            updatePTNA();
        }
    } catch (error) {
        console.error("Error fetching medicine data:", error);
    }
}

function calculateFinalDosage(element) {
    const row = element.closest("tr");
    const inputs = row.querySelectorAll("input");
    const dosage = parseFloat(inputs[2].value) || 0;
    const finalDilution = parseFloat(inputs[1].value) || 0;
    const concentrationInMl = parseFloat(inputs[0].value) || 0;
    const weight = parseFloat(document.getElementById("weight").value) || 0;

    if (concentrationInMl !== 0 && weight !== 0) {
        const finalDosage = (dosage * finalDilution * weight) / concentrationInMl;
        inputs[3].value = finalDosage.toFixed(2);
    } else {
        inputs[3].value = "0";
    }
    updateDR();
    updateRFL();
    updateGIR(); 
    updatePTNA(); 

}

function deleteMedicineRow(button) {
    const row = button.closest("tr");
    row.querySelectorAll("input, select").forEach(el => {
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0;
        } else if (el.hasAttribute('readonly')) {
            el.value = '';
        } else {
            el.value = '';
        }
    });

    updateDR();
    updateRFL();
    updateGIR();
    updatePTNA();
}

function getMedicineTableData() {
    const rows = document.querySelectorAll(".custom-table tbody tr");
    const medicines = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");
        const select = row.querySelector("select");
        medicines.push({
            serialNumber: inputs[0]?.value || "",
            medicineName: select?.value || "",
            concentrationInMl: inputs[1]?.value || "",
            finalDilution: inputs[2]?.value || "",
            dosage: inputs[3]?.value || "",
            finalDosage: inputs[4]?.value || "",
            timing: inputs[5]?.value || "",
            method: inputs[6]?.value || ""
        });
    });
    return medicines;
}

async function clearData() {
    if (confirm("⚠️ هل أنت متأكد من مسح جميع البيانات؟ سيؤدي ذلك إلى فقدان جميع البيانات المحفوظة!")) {
        try {
            await database.ref().remove();
            alert("✅ تم مسح جميع البيانات بنجاح!");
        location.reload();
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('حدث خطأ أثناء مسح البيانات');
}
    }
}

async function saveListItems(listId, items) {
    try {
        await db.saveDropdownOption(listId, items);
    } catch (error) {
        console.error('Error saving list items:', error);
}
}

async function loadDiagnosis() {
    try {
        const diagnosisData = await db.getDiagnosis();
        const diagnosisSelect = document.getElementById("diagnosis");
        if (!diagnosisSelect) {
            return;
        }
        diagnosisSelect.innerHTML = '<option value="">اختر التشخيص</option>';
        Object.values(diagnosisData).forEach(diagnosis => {
            const option = document.createElement("option");
            option.value = diagnosis.name;
            option.textContent = diagnosis.name;
            diagnosisSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading diagnosis:', error);
    }
}

async function loadProblems() {
    try {
        const problemsData = await db.getProblems();
        const problemsSelect = document.getElementById("problems");
        if (!problemsSelect) {
            return;
        }
        problemsSelect.innerHTML = '<option value="">اختر المشكلة</option>';
        
        Object.values(problemsData).forEach(problem => {
            const option = document.createElement("option");
            option.value = problem.name;
            option.textContent = problem.name;
            problemsSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading problems:', error);
    }
}

function addSession() {
    const input = document.getElementById("newSessionInput");
    const value = input.value.trim();
    if (!value) {
        alert("الرجاء إدخال اسم الجلسة!");
        return;
    }

    const select = document.getElementById("sessionsList");
    const defaultOptions = Array.from(select.options)
        .filter(option => ["", "OFF", "م.ملح /6 س - ديكسا /12 س", "م.ملح /6 س", "م.ملح مستمرة - ديكسا /12س", 
                          "م.ملح /3 س - اتروفنت /6س - ديكسا /12 س - ادرينالين/12س"]
                          .includes(option.value))
        .map(option => option.value);

    if (!defaultOptions.includes(value) && !Array.from(select.options).some(option => option.value === value)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
        saveDropdownOption("sessionsList", value);
    } else {
        alert("هذا الخيار موجود بالفعل!");
    }
    input.value = "";
}

function calculateRatePerHour() {
    const rflValue = parseFloat(document.getElementById('rflValue').value) || 0;
    const feedingAmount = document.getElementById('feedingAmount').value;
    const ratePerHourInput = document.getElementById('ratePerHour');

    if ((rflValue / 24) < 0.4 || feedingAmount === "حسب الرغبة") {
        ratePerHourInput.value = 0;
    } else {
        ratePerHourInput.value = (rflValue / 24).toFixed(2);
    }
    updateGIR(); 
    updatePTNA(); 

}

function handleRatePerHourChange() {
    const ratePerHourInput = document.getElementById('ratePerHour');
    const currentValue = ratePerHourInput.value;

    if (currentValue === "") {
        calculateRatePerHour();
    }
    updateGIR();
    updatePTNA(); 

}

function generateFileNumber() {
    let children = JSON.parse(localStorage.getItem("children")) || [];
    let lastFileNo = parseInt(localStorage.getItem("lastFileNo")) || 0;
    let newFileNo = Math.max(lastFileNo, children.length) + 1;
    document.getElementById("fileNo").value = newFileNo;
}

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

async function prefillChildFormForEdit() {
    const childId = getQueryParam('id');
    if (!childId) return;
    try {
        const childrenData = await db.getChildren();
        const child = childrenData[childId];
        if (!child) return;
        document.getElementById('fileNo').value = child.fileNo || '';
        document.getElementById('motherName').value = child.motherName || '';
        document.getElementById('childType').value = child.childType || '';
        document.getElementById('birthDate').value = child.birthDate || '';
        document.getElementById('entryDate').value = child.entryDate || '';
        document.getElementById('gestationalAge').value = child.gestationalAge || '';
        await loadBirthPlaces();
        if (child.birthPlaceId) {
            document.getElementById('birthPlace').value = child.birthPlaceId;
        }
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) saveBtn.textContent = 'تحديث البيانات';
    } catch (error) {
        console.error('Error pre-filling child form:', error);
    }
}

async function saveChildData() {
    try {
        const childId = getQueryParam('id');
        const fileNo = document.getElementById('fileNo').value;
        const motherName = document.getElementById('motherName').value;
        const childType = document.getElementById('childType').value;
        const birthDate = document.getElementById('birthDate').value;
        const entryDate = document.getElementById('entryDate').value;
        const gestationalAge = document.getElementById('gestationalAge').value;
        const birthPlaceSelect = document.getElementById('birthPlace');
        const birthPlaceId = birthPlaceSelect.value;
        const birthPlaceName = birthPlaceSelect.options[birthPlaceSelect.selectedIndex]?.textContent || '';
        if (!fileNo || !motherName || !childType || !birthDate || !entryDate || !gestationalAge || !birthPlaceId) {
            alert('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }
        const childData = {
            fileNo: fileNo,
            motherName: motherName,
            childType: childType,
            birthDate: birthDate,
            entryDate: entryDate,
            gestationalAge: gestationalAge,
            birthPlaceId: birthPlaceId,
            birthPlace: birthPlaceName,
            createdAt: new Date().toISOString()
        };
        if (childId) {
            await db.updateChild(childId, childData);
            alert('تم تحديث بيانات الطفل بنجاح');
        } else {
            await db.saveChild(childData);
            alert('تم حفظ بيانات الطفل بنجاح');
        }
        window.location.href = 'children_data.html';
    } catch (error) {
        console.error('Error saving child data:', error);
        alert(error.message || 'حدث خطأ أثناء حفظ البيانات');
    }
}

window.exportToExcel = async function() {
    try {
        const childrenObj = await db.getChildren();
        const children = Object.values(childrenObj || {});
        if (!children.length) {
            alert('لا توجد بيانات أطفال للتصدير!');
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(children);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Children Data");
        XLSX.writeFile(workbook, "Children_Data.xlsx");
    } catch (error) {
        alert('حدث خطأ أثناء تصدير البيانات إلى Excel');
    }
};

async function loadBirthPlaces() {
    try {
        if (typeof db === 'undefined') {
            console.error('Database object is not initialized');
            return;
        }

        const birthPlaces = await db.getBirthPlaces();
        const select = document.getElementById('birthPlace');
        select.innerHTML = '<option value="">اختر مكان الولادة</option>';

        Object.entries(birthPlaces).forEach(([id, place]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = place.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading birth places:', error);
        alert('حدث خطأ أثناء تحميل أماكن الولادة');
    }
}

async function addBirthPlace() {
    try {
        if (typeof db === 'undefined') {
            console.error('Database object is not initialized');
            alert('حدث خطأ في تهيئة قاعدة البيانات');
            return;
        }

        const newPlaceInput = document.getElementById('newBirthPlace');
        const newPlace = newPlaceInput.value.trim();
        
        if (!newPlace) {
            alert('الرجاء إدخال مكان الولادة');
            return;
        }
        
        await db.saveBirthPlace(newPlace);
        
        await loadBirthPlaces();
        
        const birthPlaceSelect = document.getElementById('birthPlace');
        const options = Array.from(birthPlaceSelect.options);
        const newOption = options.find(option => option.textContent === newPlace);
        if (newOption) {
            birthPlaceSelect.value = newOption.value;
        }
        
        newPlaceInput.value = '';
        
        alert('تم إضافة مكان الولادة بنجاح');
    } catch (error) {
        console.error('Error adding birth place:', error);
        alert('حدث خطأ أثناء إضافة مكان الولادة: ' + error.message);
}
}

function editChild(childId) {
    window.location.href = `add_child.html?id=${childId}`;
}

async function deleteChild(childId) {
    if (confirm("هل أنت متأكد من حذف هذا الطفل؟")) {
        try {
            await db.deleteChild(childId);
            await window.loadChildrenData(); 
        } catch (error) {
            console.error('Error deleting child:', error);
            alert("حدث خطأ أثناء حذف البيانات");
        }
    }
}

async function loadMedicines() {
    try {
        const medicinesData = await db.getMedicines();
        const tableBody = document.querySelector("#medicinesTable tbody");
        tableBody.innerHTML = "";

        Object.entries(medicinesData).forEach(([id, medicine]) => {
            const row = document.createElement("tr");
        row.innerHTML = `
                <td>${medicine.serialNumber || ''}</td>
                <td>${medicine.medicineName || ''}</td>
                <td>${medicine.concentration || ''}</td>
                <td>${medicine.dilution || ''}</td>
                <td>${medicine.concentrationInMl || ''}</td>
                <td>${medicine.finalDilution || ''}</td>
                <td>${medicine.dosage || ''}</td>
                <td>${medicine.timing || ''}</td>
                <td>${medicine.method || ''}</td>
                <td>
                    <div style="display: flex; width: 100%; height: 100%; box-sizing: border-box;">
                        <button style="flex:1; width:100%; height:100%; background-color: #007bff; color: #fff; border: none; border-radius: 0; font-weight: bold; font-size: 10pt; box-sizing: border-box; padding: 0;" onclick="editMedicine('${id}')">تعديل</button>
                        <button style="flex:1; width:100%; height:100%; background-color: #e74c3c; color: #fff; border: none; border-radius: 0; font-weight: bold; font-size: 10pt; box-sizing: border-box; padding: 0;" onclick="deleteMedicine('${id}')">حذف</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading medicines:', error);
    }
}

function editMedicine(medicineId) {
    window.location.href = `add_drug.html?id=${medicineId}`;
    }

function toggleAdditionalTable() {
    const table = document.getElementById("additionalTable");
    if (table.classList.contains("hidden")) {
        table.classList.remove("hidden");
    } else {
        table.classList.add("hidden");
    }
}

function calculateDosage(drugName, dose, weight) {
    weight = parseFloat(weight) || 0; 
    dose = parseFloat(dose) || 0;
    let result = 0;

    switch (drugName) {
        case "دوبامين":
            result = (5 * 1.44 * weight * dose) / 200;
            break;
        case "دوبتركس":
            result = (20 * 1.44 * weight * dose) / 250;
            break;
        case "نورادرينالين":
            result = (24 * 60 * weight * dose) / 1000;
            break;
        case "ادرينالين":
            result = (24 * 60 * weight * dose) / 1000;
            break;
        case "دورميكم":
            result = (24 * weight * dose) / 5;
            break;
        case "لازكس":
            result = (24 * weight * dose) / 10;
            break;
        default:
            result = 0;
    }
    return result.toFixed(2); 
}





function updatePTNA() {
    const rows = document.querySelectorAll(".custom-table tbody tr"); 
    let totalAminophyllineDosage = 0;

    rows.forEach(row => {
        const select = row.querySelector("select"); 
        const inputs = row.querySelectorAll("input"); 
        const dosage = parseFloat(inputs[2].value) || 0; 

        if (select && select.value === "امينوفين") {
            totalAminophyllineDosage += dosage; 
        }
    });

    document.getElementById("ptnAValue").value = totalAminophyllineDosage.toFixed(2); 
}

function resetFields() {
    if (window.location.pathname.includes("index.html")) {
        try {
            document.getElementById("childName").value = "";
            document.getElementById("childNameBack").value = "";

            document.getElementById("childType").value = "";
            document.getElementById("gestationalAge").value = "";
            document.getElementById("extraConsiderations").value = "";
            document.getElementById("general1").value = "";
            document.getElementById("general2").value = "";
            document.getElementById("general3").value = "";
            document.getElementById("general4").value = "";
            document.getElementById("cns1").value = "";
            document.getElementById("cns2").value = "";
            document.getElementById("cns3").value = "";
            document.getElementById("cns4").value = "";
            document.getElementById("cvs1").value = "";
            document.getElementById("cvs2").value = "";
            document.getElementById("cvs3").value = "";
            document.getElementById("cvs4").value = "";
            document.getElementById("chest1").value = "";
            document.getElementById("chest2").value = "";
            document.getElementById("chest3").value = "";
            document.getElementById("chest4").value = "";
            document.getElementById("abdomen1").value = "";
            document.getElementById("abdomen2").value = "";
            document.getElementById("abdomen3").value = "";
            document.getElementById("extremities1").value = "";
            document.getElementById("extremities2").value = "";
            document.getElementById("others1").value = "";
            document.getElementById("others2").value = "";

            document.getElementById("referred").value = "";
            document.getElementById("age").value = "";
            document.getElementById("days").value = "";
            document.getElementById("weight").value = "";
            document.getElementById("lastLab").value = "";
            document.getElementById("feedingAmount2").value = "";
            document.getElementById("problemText").value = "";
            document.getElementById("otherNotes").value = "";
            document.getElementById("oxygenList").value = "OFF";
            document.getElementById("sessionsList").value = "";
            document.getElementById("phototherapyList").value = "OFF";
            document.getElementById("mlPerKg").value = "";
            document.getElementById("fluidType").value = "-- اختر --";
            document.getElementById("ratePerHour").value = "";
            document.getElementById("feedingAmount3").value = "";
            document.getElementById("feedingAmount").value = "";
            document.getElementById("milkType").value = "";
            document.getElementById("feedingTime").value = "";
            document.getElementById("feedingMethod").value = "";
            document.getElementById("extraOption").value = "";
            document.getElementById("tfValue").value = "";
            document.getElementById("milkValue").value = "";
            document.getElementById("drRemainingFl").value = "";
            document.getElementById("rflValue").value = "";
            document.getElementById("ptnMValue").value = "";
            document.getElementById("tciValue").value = "";
            document.getElementById("girValue").value = ""; 
            document.getElementById("ptnAValue").value = "";
            document.getElementById("ptnAValue").value = "";
            document.getElementById("care1").value = "";
            document.getElementById("care2").value = "";
            document.getElementById("care3").value = "";
            document.getElementById("care4").value = "";
            document.getElementById("care5").value = "";

            document.getElementById("labsTiming").value = "";
            document.getElementById("labsList1").value = "";
            document.getElementById("labsList2").value = "";
            document.getElementById("labsList3").value = "";
            document.getElementById("labsList4").value = "";
            document.getElementById("dailyNotes").value = "";
            document.getElementById("observationsList").value = "";
            document.getElementById("radiologyList").value = "NO";
            document.getElementById("physician").value = "";




            if (typeof loadMedicineTable === "function") {
                loadMedicineTable([]);
            } else {
                console.warn("دالة loadMedicineTable غير موجودة.");
            }

            if (typeof updateDate === "function") {
                updateDate();
            } else {
                console.warn("دالة updateDate غير موجودة.");
                document.getElementById("dateBox").value = new Date().toLocaleDateString("ar-EG");
            }
        } catch (error) {
            console.error("خطأ أثناء إعادة تعيين الحقول:", error);
            alert("حدث خطأ أثناء إعادة تعيين الحقول. تحقق من وحدة التحكم للتفاصيل.");
        }
    } else {
        console.log("دالة resetFields لم تُنفذ لأن الصفحة ليست index.html");
    }
}

async function fetchChildData() {
    try {
        const fileNo = document.getElementById("fileNo").value.trim();
        if (!fileNo) {
            resetFields();
            return;
        }

        const children = await db.getChildren();
        let child = null;
        for (const [id, c] of Object.entries(children)) {
            if (c.fileNo == fileNo) {
                child = c;
                break;
            }
        }
        if (child) {
            document.getElementById("childName").value = child.motherName || "";
            document.getElementById("childNameBack").value = child.motherName || "";
            document.getElementById("childType").value = child.childType || "";
            document.getElementById("gestationalAge").value = child.gestationalAge || "";
            if (child.birthDate) {
                const birth = new Date(child.birthDate);
                const today = new Date();
                const ageDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
                document.getElementById("age").value = ageDays;
            }
            if (child.entryDate) {
                const entry = new Date(child.entryDate);
                const today = new Date();
                const stayDays = Math.floor((today - entry) / (1000 * 60 * 60 * 24));
                document.getElementById("days").value = stayDays;
            }
            document.getElementById("referred").value = child.birthPlace || "";
        } else {
            resetFields();
            return;
        }
        await populateMedicineDropdowns();
    } catch (error) {
        console.error("خطأ أثناء جلب بيانات المتابعة:", error);
        alert("حدث خطأ أثناء جلب بيانات المتابعة. تحقق من وحدة التحكم للتفاصيل.");
    }
}

async function populateMedicineDropdowns() {
    try {
        const medicines = await db.getMedicines();
        const medicineSelects = document.querySelectorAll('.custom-table select');
        medicineSelects.forEach(select => {
            while (select.options.length > 1) {
                select.remove(1);
            }
            Object.values(medicines).forEach(medicine => {
                const option = document.createElement('option');
                option.value = medicine.medicineName;
                option.textContent = medicine.medicineName;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error("Error loading medicines:", error);
    }
}



async function loadMainPageData(fileNo) {
    try {
        const data = await db.getMainPageData(fileNo);
        if (data) {
            document.getElementById("weight").value = data.weight || "";
            document.getElementById("mlPerKg").value = data.mlPerKg || "";
            document.getElementById("fluidType").value = data.fluidType || "";
            document.getElementById("ratePerHour").value = data.ratePerHour || "";
            document.getElementById("feedingAmount").value = data.feedingAmount || "";
            
            document.getElementById("milkType").value = data.milkType || "";
            document.getElementById("feedingTime").value = data.feedingTime || "";
            document.getElementById("feedingMethod").value = data.feedingMethod || "";
            document.getElementById("extraOption").value = data.extraOption || "";
            document.getElementById("feedingAmount2").value = data.feedingAmount2 || "";
            document.getElementById("extraConsiderations").value = data.extraConsiderations || "";
            document.getElementById("care1").value = data.care1 || "";
            document.getElementById("care2").value = data.care2 || "";
            document.getElementById("care3").value = data.care3 || "";
            document.getElementById("care4").value = data.care4 || "";
            document.getElementById("care5").value = data.care5 || "";
            document.getElementById("general1").value = data.general1 || "";
            document.getElementById("general2").value = data.general2 || "";
            document.getElementById("general3").value = data.general3 || "";
            document.getElementById("general4").value = data.general4 || "";
            document.getElementById("cns1").value = data.cns1 || "";
            document.getElementById("cns2").value = data.cns2 || "";
            document.getElementById("cns3").value = data.cns3 || "";
            document.getElementById("cns4").value = data.cns4 || "";
            document.getElementById("cvs1").value = data.cvs1 || "";
            document.getElementById("cvs2").value = data.cvs2 || "";
            document.getElementById("cvs3").value = data.cvs3 || "";
            document.getElementById("cvs4").value = data.cvs4 || "";
            document.getElementById("chest1").value = data.chest1 || "";
            document.getElementById("chest2").value = data.chest2 || "";
            document.getElementById("chest3").value = data.chest3 || "";
            document.getElementById("chest4").value = data.chest4 || "";
            document.getElementById("abdomen1").value = data.abdomen1 || "";
            document.getElementById("abdomen2").value = data.abdomen2 || "";
            document.getElementById("abdomen3").value = data.abdomen3 || "";
            document.getElementById("extremities1").value = data.extremities1 || "";
            document.getElementById("extremities2").value = data.extremities2 || "";
            document.getElementById("others1").value = data.others1 || "";
            document.getElementById("others2").value = data.others2 || "";
            document.getElementById("problemText").value = data.problemText || "";
            document.getElementById("otherNotes").value = data.otherNotes || "";
            document.getElementById("oxygenList").value = data.oxygenList || "OFF";
            document.getElementById("sessionsList").value = data.sessionsList || "";
            document.getElementById("phototherapyList").value = data.phototherapyList || "OFF";
            document.getElementById("feedingAmount3").value = data.feedingAmount3 || "";
            document.getElementById("lastLab").value = data.lastLab || "";
            document.getElementById("labsTiming").value = data.labsTiming || "";
            document.getElementById("labsList1").value = data.labsList1 || "";
            document.getElementById("labsList2").value = data.labsList2 || "";
            document.getElementById("labsList3").value = data.labsList3 || "";
            document.getElementById("labsList4").value = data.labsList4 || "";
            document.getElementById("dailyNotes").value = data.dailyNotes || "";
            document.getElementById("observationsList").value = data.observationsList || "";
            document.getElementById("radiologyList").value = data.radiologyList || "NO";
            document.getElementById("physician").value = data.physician || "";

            updateTF();
            updateMILK();
            if (data.medicines) {
                await loadMedicineTable(data.medicines);
            }
            updateDR();
            updateRFL();
            updatePTNM();
            updateTCI();
            updateGIR();
            updatePTNA();
        } else {
            resetFields();
        }
    } catch (error) {
        console.error("Error loading data:", error);
        alert("An error occurred while loading the data! Check the console.");
    }
}

window.deleteMedicine = async function(medicineId) {
    if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;
    try {
        await db.deleteMedicine(medicineId);
        await loadMedicines();
    } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('حدث خطأ أثناء حذف الدواء');
    }
};

function excelDateToJSDate(serial) {
    if (typeof serial === 'string') return serial; 
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
}

window.importFromExcel = async function(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const children = XLSX.utils.sheet_to_json(worksheet);
            if (!children.length) {
                alert('لم يتم العثور على بيانات في ملف Excel!');
                return;
            }
            let successCount = 0;
            for (const child of children) {
                if (child.birthDate) child.birthDate = excelDateToJSDate(child.birthDate);
                if (child.entryDate) child.entryDate = excelDateToJSDate(child.entryDate);
                try {
                    await db.saveChild(child);
                    successCount++;
                } catch (err) {
                }
            }
            alert(`تم استيراد ${successCount} طفل بنجاح!`);
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        alert('حدث خطأ أثناء الاستيراد من Excel');
    }
};

if (document.getElementById("fileNo")) {
    let fileNoDebounceTimeout = null;
    document.getElementById("fileNo").addEventListener("input", function() {
        clearTimeout(fileNoDebounceTimeout);
        fileNoDebounceTimeout = setTimeout(async () => {
            const fileNo = this.value.trim();
            if (fileNo.length > 0) {
                await fetchChildData(); 
                setTimeout(async () => {
                    const mainData = await db.getMainPageData(fileNo);
                    console.log("Loaded mainData for fileNo", fileNo, mainData); 
                    if (mainData) {
                        const fields = [
                            "weight","lastLab","feedingAmount2","problemText","otherNotes","oxygenList","sessionsList","phototherapyList","mlPerKg","fluidType","feedingAmount3","feedingAmount","milkType","feedingTime","feedingMethod","extraOption","extraConsiderations","care1","care2","care3","care4","care5","labsTiming","labsList1","labsList2","labsList3","labsList4","dailyNotes","observationsList","radiologyList","physician","general1","general2","general3","general4","cns1","cns2","cns3","cns4","cvs1","cvs2","cvs3","cvs4","chest1","chest2","chest3","chest4","abdomen1","abdomen2","abdomen3","extremities1","extremities2","others1","others2"
                        ];
                        fields.forEach(id => {
                            if (document.getElementById(id) && mainData[id] !== undefined) {
                                document.getElementById(id).value = mainData[id];
                            }
                        });
                        if (mainData.medicines) {
                            await loadMedicineTable(mainData.medicines);
                        }
                        
                    }
                }, 1000); 
            }
        }, 800); 
    });
}

async function saveMainPageData() {
    const fileNo = document.getElementById("fileNo").value.trim();
    if (!fileNo) {
        alert("الرجاء إدخال رقم الملف أولاً!");
        return;
    }
    try {
        const mainData = {
            fileNo: fileNo,
            childName: document.getElementById("childName").value || "",
            childType: document.getElementById("childType").value || "",
            gestationalAge: document.getElementById("gestationalAge").value || "",
            dateBox: document.getElementById("dateBox").value || "",
            age: document.getElementById("age").value || "",
            days: document.getElementById("days").value || "",
            weight: document.getElementById("weight").value || "",
            lastLab: document.getElementById("lastLab").value || "",
            referred: document.getElementById("referred").value || "",
            feedingAmount2: document.getElementById("feedingAmount2").value || "",
            problemText: document.getElementById("problemText").value || "",
            otherNotes: document.getElementById("otherNotes").value || "",
            oxygenList: document.getElementById("oxygenList").value || "",
            sessionsList: document.getElementById("sessionsList").value || "",
            phototherapyList: document.getElementById("phototherapyList").value || "",
            mlPerKg: document.getElementById("mlPerKg").value || "",
            fluidType: document.getElementById("fluidType").value || "",
            ratePerHour: document.getElementById("ratePerHour").value || "",
            feedingAmount3: document.getElementById("feedingAmount3").value || "",
            feedingAmount: document.getElementById("feedingAmount").value || "",
            milkType: document.getElementById("milkType").value || "",
            feedingTime: document.getElementById("feedingTime").value || "",
            feedingMethod: document.getElementById("feedingMethod").value || "",
            extraOption: document.getElementById("extraOption").value || "",
            extraConsiderations: document.getElementById("extraConsiderations").value || "",
            tfValue: document.getElementById("tfValue").value || "",
            milkValue: document.getElementById("milkValue").value || "",
            drRemainingFl: document.getElementById("drRemainingFl").value || "",
            rflValue: document.getElementById("rflValue").value || "",
            ptnMValue: document.getElementById("ptnMValue").value || "",
            tciValue: document.getElementById("tciValue").value || "",
            girValue: document.getElementById("girValue").value || "",
            ptnAValue: document.getElementById("ptnAValue").value || "",
            labsTiming: document.getElementById("labsTiming").value || "",
            labsList1: document.getElementById("labsList1").value || "",
            labsList2: document.getElementById("labsList2").value || "",
            labsList3: document.getElementById("labsList3").value || "",
            labsList4: document.getElementById("labsList4").value || "",
            dailyNotes: document.getElementById("dailyNotes").value || "",
            observationsList: document.getElementById("observationsList").value || "",
            radiologyList: document.getElementById("radiologyList").value || "",
            physician: document.getElementById("physician").value || "",
            care1: document.getElementById("care1").value || "",
            care2: document.getElementById("care2").value || "",
            care3: document.getElementById("care3").value || "",
            care4: document.getElementById("care4").value || "",
            care5: document.getElementById("care5").value || "",
            general1: document.getElementById("general1").value || "",
            general2: document.getElementById("general2").value || "",
            general3: document.getElementById("general3").value || "",
            general4: document.getElementById("general4").value || "",
            cns1: document.getElementById("cns1").value || "",
            cns2: document.getElementById("cns2").value || "",
            cns3: document.getElementById("cns3").value || "",
            cns4: document.getElementById("cns4").value || "",
            cvs1: document.getElementById("cvs1").value || "",
            cvs2: document.getElementById("cvs2").value || "",
            cvs3: document.getElementById("cvs3").value || "",
            cvs4: document.getElementById("cvs4").value || "",
            chest1: document.getElementById("chest1").value || "",
            chest2: document.getElementById("chest2").value || "",
            chest3: document.getElementById("chest3").value || "",
            chest4: document.getElementById("chest4").value || "",
            abdomen1: document.getElementById("abdomen1").value || "",
            abdomen2: document.getElementById("abdomen2").value || "",
            abdomen3: document.getElementById("abdomen3").value || "",
            extremities1: document.getElementById("extremities1").value || "",
            extremities2: document.getElementById("extremities2").value || "",
            others1: document.getElementById("others1").value || "",
            others2: document.getElementById("others2").value || "",
            medicines: getMedicineTableData(),
            timestamp: new Date().toISOString()
        };
        await db.saveMainPageData(fileNo, mainData);
        alert("✅ تم حفظ بيانات المتابعة بنجاح!");
    } catch (error) {
        console.error("خطأ أثناء حفظ البيانات:", error);
        alert("حدث خطأ أثناء الحفظ! تحقق من وحدة التحكم لمزيد من التفاصيل.");
    }
}

window.saveMainPageData = saveMainPageData;

function checkMLPerKgWarning() {
    const mlPerKgInput = document.getElementById("mlPerKg");
    const weightInput = document.getElementById("weight");
    const warningDiv = document.getElementById("mlPerKgWarning");
    
    const mlPerKg = parseFloat(mlPerKgInput.value);
    const weight = parseFloat(weightInput.value);
    
    if (!isNaN(mlPerKg) && !isNaN(weight)) {
        const minMLPerKg = 60;
        const maxMLPerKg = 160;
        
        if (mlPerKg < minMLPerKg) {
            warningDiv.textContent = `يرجى ملاحظة أن الحد الأدنى للمحلول هو ${minMLPerKg} مل/كجم`;
            warningDiv.style.display = "block";
        } else if (mlPerKg > maxMLPerKg) {
            warningDiv.textContent = `يرجى ملاحظة أن الحد الأقصى للمحلول هو ${maxMLPerKg} مل/كجم`;
            warningDiv.style.display = "block";
        } else {
            warningDiv.style.display = "none";
        }
    } else {
        warningDiv.style.display = "none";
    }
}
