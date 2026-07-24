import React, { useEffect, useState } from "react";
import { InformationFormData } from "../../../models/informationModel";
import { InformationService } from "../../../services/informationService";
import { CampusDTO, FacultyDTO, MajorDTO } from "../../../models/universityModel";

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

  const years = InformationService.getYearsByEdu(formData.edu);

  // 1. Fetch campuses from backend
  useEffect(() => {
    InformationService.getCampuses().then((data) => {
      setCampuses(data);
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
        InformationService.getFacultiesByCampus(selectedCampus.id).then((data) => {
          setFaculties(data);
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
        InformationService.getMajorsByFacultyId(idToQuery).then((data) => {
          setMajors(data);
        });
      } else {
        setMajors([]);
      }
    } else {
      setMajors([]);
    }
  }, [formData.faculty, faculties]);

  return (
    <div className="panel active">
      <div className="field">
        <label>วิทยาเขต</label>
        <div className="select-wrap">
          <select
            value={formData.campus}
            onChange={(e) => setFormDataField("campus", e.target.value)}
          >
            <option value="" disabled>
              เลือกวิทยาเขต...
            </option>
            {campuses.map((c) => (
              <option key={c.id} value={c.campus}>
                {c.campus}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div>
          <label>คณะ</label>
          <div className="select-wrap">
            <select
              value={formData.faculty}
              onChange={(e) => setFormDataField("faculty", e.target.value)}
              disabled={!formData.campus}
            >
              <option value="" disabled>
                เลือกคณะ...
              </option>
              {faculties.map((f) => {
                const fName = f.facultyName ?? f.faculty;
                const fKey = f.facultyId ?? f.id ?? fName;
                return (
                  <option key={fKey} value={fName}>
                    {fName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div>
          <label>สาขาวิชา</label>
          <div className="select-wrap">
            <select
              value={formData.major}
              onChange={(e) => setFormDataField("major", e.target.value)}
              disabled={!formData.faculty}
            >
              <option value="" disabled>
                เลือกสาขา...
              </option>
              {formData.faculty &&
                majors.map((m) => {
                  const mName = m.majorName ?? m.major;
                  const mKey = m.majorId ?? m.id ?? mName;
                  return (
                    <option key={mKey} value={mName}>
                      {mName}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
      </div>

      <div className="field-row" style={{ justifyContent: "center" }}>
        <div>
          <label>ชั้นปี / ปีการศึกษา</label>
          <div className="select-wrap">
            <select
              value={formData.year}
              onChange={(e) => setFormDataField("year", e.target.value)}
            >
              <option value="" disabled>
                เลือกชั้นปี...
              </option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
