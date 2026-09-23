import React, { useEffect, useState } from "react";
import { InformationFormData } from "../../../models/informationModel";
import { InformationService } from "../../../services/informationService";
import { CampusDTO, FacultyDTO, MajorDTO } from "../../../models/universityModel";
import { Dropdown, DropdownOption } from "../../common/Dropdown";

interface StepGeneralInfoProps {
  formData: InformationFormData;
  setFormDataField: (field: keyof InformationFormData, value: string) => void;
}

export const StepGeneralInfo: React.FC<StepGeneralInfoProps> = ({
  formData,
  setFormDataField,
}) => {
  const [campuses, setCampuses] = useState<CampusDTO[]>([]);
  const [faculties, setFaculties] = useState<FacultyDTO[]>([]);
  const [majors, setMajors] = useState<MajorDTO[]>([]);
  const [loadError, setLoadError] = useState<string>("");

  const years = InformationService.getYearsByEdu(formData.edu);

  // 1. Fetch campuses from backend
  useEffect(() => {
    InformationService.getCampuses()
      .then((data) => setCampuses(data))
      .catch((e) => {
        console.error("Error fetching campuses from backend:", e);
        setLoadError("โหลดข้อมูลวิทยาเขตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      });
  }, []);

  // 2. Fetch faculties from backend when campus changes
  useEffect(() => {
    if (formData.campus && campuses.length > 0) {
      const selectedCampus = campuses.find(
        (c) =>
          c.campus === formData.campus ||
          String(c.id) === String(formData.campus) ||
          String(c.campusId) === String(formData.campus)
      );
      if (selectedCampus) {
        InformationService.getFacultiesByCampus(selectedCampus.id)
          .then((data) => setFaculties(data))
          .catch((e) => {
            console.error("Error fetching faculties from backend:", e);
            setLoadError("โหลดข้อมูลคณะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          });
      } else {
        setFaculties([]);
      }
    } else {
      setFaculties([]);
    }
  }, [formData.campus, campuses]);

  // 3. Fetch majors from backend when faculty changes
  useEffect(() => {
    if (formData.faculty && faculties.length > 0) {
      const selectedFaculty = faculties.find(
        (f) =>
          f.facultyName === formData.faculty ||
          f.faculty === formData.faculty ||
          String(f.facultyId) === String(formData.faculty) ||
          String(f.id) === String(formData.faculty)
      );
      if (selectedFaculty) {
        const idToQuery = Number(selectedFaculty.facultyId ?? selectedFaculty.id);
        InformationService.getMajorsByFacultyId(idToQuery)
          .then((data) => setMajors(data))
          .catch((e) => {
            console.error("Error fetching majors from backend:", e);
            setLoadError("โหลดข้อมูลสาขาวิชาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          });
      } else {
        setMajors([]);
      }
    } else {
      setMajors([]);
    }
  }, [formData.faculty, faculties]);

  const campusOptions: DropdownOption[] = campuses.map((c) => ({
    value: c.campus,
    label: c.campus,
  }));

  const facultyOptions: DropdownOption[] = faculties.map((f) => ({
    value: f.facultyName ?? f.faculty,
    label: f.facultyName ?? f.faculty,
  }));

  const majorOptions: DropdownOption[] = formData.faculty
    ? majors.map((m) => ({
        value: m.majorName ?? m.major,
        label: m.majorName ?? m.major,
      }))
    : [];

  const yearOptions: DropdownOption[] = years.map((y) => ({ value: y, label: y }));

  return (
    <div className="panel active">
      {loadError && <p className="form-error">{loadError}</p>}

      <div className="field">
        <label htmlFor="info-campus">วิทยาเขต</label>
        <Dropdown
          id="info-campus"
          value={formData.campus}
          options={campusOptions}
          placeholder="เลือกวิทยาเขต..."
          emptyText="ยังไม่มีข้อมูลวิทยาเขต"
          onChange={(val) => {
            setFormDataField("campus", val);
            const selected = campuses.find((c) => c.campus === val);
            setFormDataField("campusId", selected ? String(selected.id) : "");
          }}
        />
      </div>

      <div className="field-row">
        <div>
          <label htmlFor="info-faculty">คณะ</label>
          <Dropdown
            id="info-faculty"
            value={formData.faculty}
            options={facultyOptions}
            placeholder="เลือกคณะ..."
            emptyText="เลือกวิทยาเขตก่อน"
            disabled={!formData.campus}
            onChange={(val) => {
              setFormDataField("faculty", val);
              const selected = faculties.find(
                (f) => (f.facultyName ?? f.faculty) === val
              );
              const fId = selected ? (selected.facultyId ?? selected.id) : "";
              setFormDataField("facultyId", fId !== "" ? String(fId) : "");
            }}
          />
        </div>
        <div>
          <label htmlFor="info-major">สาขาวิชา</label>
          <Dropdown
            id="info-major"
            value={formData.major}
            options={majorOptions}
            placeholder="เลือกสาขา..."
            emptyText="เลือกคณะก่อน"
            disabled={!formData.faculty}
            onChange={(val) => {
              setFormDataField("major", val);
              const selected = majors.find((m) => (m.majorName ?? m.major) === val);
              const mId = selected ? (selected.majorId ?? selected.id) : "";
              setFormDataField("majorId", mId !== "" ? String(mId) : "");
            }}
          />
        </div>
      </div>

      <div className="field-row" style={{ justifyContent: "center" }}>
        <div>
          <label htmlFor="info-year">ชั้นปี / ปีการศึกษา</label>
          <Dropdown
            id="info-year"
            value={formData.year}
            options={yearOptions}
            placeholder="เลือกชั้นปี..."
            onChange={(val) => setFormDataField("year", val)}
          />
        </div>
      </div>
    </div>
  );
};
